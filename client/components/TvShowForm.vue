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
      <div class="form-label">Search TV-Show by name</div>
      <input class="form-input" type="text" placeholder="Enter TV-Show name..." v-model="inputShow" @keyup.enter="searchShow( $event.target.value )" />
    </div>

    <div class="form-row" v-if="showList.length">
      <div class="form-label">Select TV-Show from list</div>
      <select class="form-input clickable">
        <option v-for="show in showList" :key="show.id" @click="selectShow( show.id, show.name )">
          {{ show.name }}
        </option>
      </select>
    </div>

    <div class="form-row" v-if="showId">
      <div class="form-label">TV-Show Season/Episode info</div>
      <input class="form-input" type="text" placeholder="Episode info, ie: 2x5, S02E05, s2e5, etc." v-model="inputEpisode" @keyup.enter="searchEpisode( $event.target.value )">
    </div>

    <div class="form-row">
      <div class="form-label">Final TV-Show file name</div>
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
      inputShow: '', // input show name
      inputEpisode: '', // input episode info
      showList: [], // list of movies from API
      showId: '', // selected show id
      showName: '', // selected show name
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
      return ( this.busy || !this.showList.length || this.finalPath === '' );
    }
  },

  // custom methods
  methods: {

    // resey current values
    resetValues( e ) {
      this.showList    = [];
      this.showId      = '';
      this.showName    = '';
      this.finalPath   = '';
      this.forceWrite  = false;
    },

    // trigger movie search from backend/api
    searchShow( showName ) {
      showName = Utils.stripName( showName );

      if ( !showName ) {
        return this.$bus.$emit( 'showAlert', 'Please enter a TV-Show name.', 'warning' );
      }
      if ( this.busy ) {
        return this.$bus.$emit( 'showAlert', 'Please wait for the current request.', 'warning' );
      }
      this.resetValues();
      this.busy = true;

      new Ajax( 'POST', API.tvSearch, {
        data: {
          name: showName,
        },
        error: ( xhr, error ) => {
          this.$bus.$emit( 'showAlert', error, 'error' );
        },
        success: ( xhr, response ) => {
          if ( !response.data || !response.data.results || !response.data.results.length ) {
            return this.$bus.$emit( 'showAlert', 'No results found for: '+ showName, 'warning' );
          }
          for ( let i = 0; i < response.data.results.length; ++i ) {
            let show   = response.data.results[ i ];
            let s_name = Utils.stripName( show.name || showName );
            if ( !show.id || !s_name ) continue;
            this.showList.push( { id: show.id, name: s_name } );
          }
          if ( this.showList.length ) {
            this.selectShow( this.showList[0].id, this.showList[0].name );
          }
        },
        complete: ( xhr, response ) => {
          this.busy = false;
        },
      });
    },

    // select a show by id
    selectShow( showId, showName ) {
      this.showId = showId | 0;
      this.showName = showName || '';
      this.finalPath = '';
    },

    // search for episode from api
    searchEpisode( epInfo ) {
      epInfo = String( epInfo|| '' ).toLowerCase().replace( /[^sex\d]+/gi, '' ).trim();

      let case1   = epInfo.match( /^s([0-9]+)\s?e([0-9+]+)$/i );
      let case2   = epInfo.match( /^([0-9]+)\s?\x\s?([0-9+]+)$/i );
      let season  = 0;
      let episode = 0;

      if ( case1 && case1.length === 3 ) {
        season  = case1[1] | 0;
        episode = case1[2] | 0;
      }
      else if ( case2 && case2.length === 3 ) {
        season  = case2[1] | 0;
        episode = case2[2] | 0;
      }
      if ( !season || !episode ) {
        return this.$bus.$emit( 'showAlert', 'Invalid episode information: '+ epInfo, 'warning' );
      }
      if ( !this.showId ) {
        return this.$bus.$emit( 'showAlert', 'Please select a show before searching for episode info.', 'warning' );
      }
      this.busy = true;
      this.finalPath = '';

      new Ajax( 'POST', API.tvEpisode, {
        data: {
          id: this.showId,
          season: season,
          episode: episode,
        },
        error: ( xhr, error ) => {
          this.$bus.$emit( 'showAlert', error, 'error' );
        },
        success: ( xhr, response ) => {
          if ( !response.data || !response.data.name ) {
            return this.$bus.$emit( 'showAlert', 'Could not find episode name, try again. ', 'warning' );
          }
          this.buildPath( response.data.name, season, episode );
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
    buildPath( ep_name, ep_season, ep_number ) {
      if ( !ep_name || !ep_season || !ep_number ) return;
      let name       = Utils.stripName( ep_name );
      let season     = Utils.leftPad( ep_season, 2, '0' );
      let episode    = Utils.leftPad( ep_number, 2, '0' );
      let ext        = this.item.name.split( '.' ).pop();
      this.finalPath = this.device.path + '/Shows/'+ this.showName +'/Season '+ season +'/S'+ season +' E'+ episode +' - '+ name +'.'+ ext;
    },
  },

  // on mounted
  mounted() {
    let filename = String( this.item.name ).replace( /\.[\w\-]+$/, '' );
    let matches = filename.match( /^(.*)(s[0-9]+\s?e[0-9]+)(.*)$/i );

    if ( matches && matches.length === 4 ) {

      // 1. auto fill show input
      this.inputShow = String( matches[1] )
        .replace( /[^\w\s\'\:]+/g, ' ' )
        .replace( /\s\s+/g, ' ' )
        .trim();

      // 2. auto fill episode info
      this.inputEpisode = matches[2];

      // 3. do api search
      setTimeout( () => {
        this.searchShow( this.inputShow );
      }, 800 );
    }
  },
}
</script>

