<template>
  <div class="mediaform-wrap">

    <div class="mediaform-info">
      <div class="flex-row flex-middle">
        <span class="flex-label push-right">Path:</span>
        <span class="flex-100 text-info text-clip">{{ location }}</span>
      </div>
      <div class="flex-row flex-middle">
        <span class="flex-label push-right">File:</span>
        <span class="flex-100 text-primary text-clip">{{ item.name }}</span>
      </div>
      <div class="flex-row flex-middle">
        <span class="flex-label push-right">Info:</span>
        <span class="flex-100 text-clip">
          <span class="text-success">{{ item.size }}</span> &nbsp;
          <span class="text-grey">{{ item.modified }}</span>
        </span>
      </div>
    </div>

    <hr />

    <div class="form-row">
      <div class="form-label">Search movie by name</div>
      <input class="form-input" type="text" placeholder="Enter movie name..." v-model="inputMovie" @keyup.enter="searchMovie( $event.target.value )" />
    </div>

    <div class="form-row" v-if="movieList.length">
      <div class="form-label">Select movie from list</div>
      <select class="form-input clickable" @change="buildPath( $event.target.value )">
        <option v-for="title in movieList" :value="title" :key="title">{{ title }}</option>
      </select>
    </div>

    <div class="form-row">
      <div class="form-label">Final movie file name</div>
      <input class="form-input" type="text" placeholder="New file name..." v-model="finalPath" />
    </div>

    <div class="form-row">
      <div class="form-label">File Options</div>
    </div>

    <div class="form-row">
      <label class="form-toggle">
        <input type="checkbox" v-model="forceWrite" />
        <span>Override existing file.</span>
      </label>
    </div>

    <div class="form-row">
      <hr />
      <button class="form-btn bg-success-hover" type="button" :disabled="btnDisabled" @click="saveValues">
        <i class="icon-file icon-pr"></i> Rename
      </button> &nbsp;
      <button class="form-btn bg-default-hover" type="button" @click="resetValues">
        <i class="icon-reload icon-pr"></i> Reset
      </button>
    </div>

  </div>
</template>

<script>
import API from '../../common/api';
import Utils from '../../common/utils';
import Ajax from '../scripts/Ajax';
import Prompt from '../scripts/Prompt';

export default {

  // component data
  data() {
    return {
      busy: false, // api request state
      inputMovie: '', // input name to search
      movieList: [], // list of movies from API
      finalPath: '', // final file full path
      forceWrite: false,
    }
  },

  // component props
  props: {
    device: { type: Object, default: {}, required: false },
    location: { type: String, default: '/', required: false },
    item: { type: Object, default: {}, required: false },
  },

  // computed methods
  computed: {

    // disable save button until final path is built
    btnDisabled() {
      return ( this.busy || !this.movieList.length || this.finalPath === '' );
    }
  },

  // custom methods
  methods: {

    // resey current values
    resetValues( e ) {
      this.movieList  = [];
      this.finalPath  = '';
      this.forceWrite = false;
    },

    // trigger movie search from backend/api
    searchMovie( movieName ) {
      movieName = Utils.stripName( movieName );

      if ( !movieName ) {
        return this.$bus.$emit( 'showAlert', 'Please enter a Movie name.', 'warning' );
      }
      if ( this.busy ) {
        return this.$bus.$emit( 'showAlert', 'Please wait for the current request.', 'warning' );
      }
      this.resetValues();
      this.busy = true;

      new Ajax( 'POST', API.movieSearch, {
        data: {
          name: movieName,
        },
        error: ( xhr, error ) => {
          this.$bus.$emit( 'showAlert', error, 'error' );
        },
        success: ( xhr, response ) => {
          if ( !response.data || !response.data.results || !response.data.results.length ) {
            return this.$bus.$emit( 'showAlert', 'No results found for: '+ movieName, 'warning' );
          }
          let date = new Date();
          let year = date.getUTCFullYear();

          for ( let i = 0; i < response.data.results.length; ++i ) {
            let movie   = response.data.results[ i ];
            let m_year  = parseInt( movie.release_date || year );
            let m_title = String( movie.title || movieName )
              .replace( /[^\w\-\.\,\'\(\)\[\]\s]+/g, ',' )
              .replace( /\,\,+/g, ',' )
              .replace( /^\,+|\,+$/g, '' );
            this.movieList.push( m_title +' - '+ m_year );
          }
          if ( this.movieList.length ) {
            this.buildPath( this.movieList[0] );
          }
        },
        complete: ( xhr, response ) => {
          this.busy = false;
        },
      });
    },

    // final method to save changes
    finalSave() {
      if ( !this.finalPath ) {
        return this.$bus.$emit( 'showAlert', 'Please complete the form before saving.', 'warning' );
      }
      this.busy = true;

      new Ajax( 'POST', API.move, {
        data: {
          path: this.item.path,
          newpath: this.finalPath,
          force: this.forceWrite,
        },
        error: ( xhr, error ) => {
          this.$bus.$emit( 'showAlert', error, 'error' );
        },
        success: ( xhr, response ) => {
          this.$bus.$emit( 'showAlert', response.message || 'File moved successfully.', 'success' );
          this.$emit( 'fetchListing', this.location, true ); // force list reload
          this.resetValues();
        },
        complete: ( xhr, response ) => {
          this.busy = false;
        },
      });
    },

    // save final values
    saveValues( e ) {
      if ( this.finalPath ) {
        new Prompt({
          title: 'Confirmation',
          confirm: 'This will rename and move this file, are you sure?',
          acceptText: 'Rename',
          onAccept: this.finalSave,
        });
      }
    },

    // when a movie has been selected from the dropdown
    buildPath( name ) {
      let ext = this.item.name.split( '.' ).pop();
      this.finalPath = this.device.path + '/Movies/'+ name +'/'+ name +'.'+ ext;
    },
  },

  // on mounted
  mounted() {
    let filename = String( this.item.name ).replace( /\.[\w\-]+$/, '' );
    let matches = filename.match( /^(.*)((19|20)\d{2})(.*)$/ );

    if ( matches && matches.length === 4 ) {

      // 1. auto fill input
      this.inputMovie = String( matches[1] )
        .replace( /[^\w\s\'\:]+/g, ' ' )
        .replace( /\s\s+/g, ' ' )
        .trim();

      // 2. do api search
      setTimeout( () => {
        this.searchMovie( this.inputMovie );
      }, 800 );
    }
  },
}
</script>

