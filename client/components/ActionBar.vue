<template>
  <div class="actionbar-wrap">

    <div class="actionbar-group actionbar-toggle">
      <button type="button" class="clickable" title="Sidebar" v-tooltip @click="$emit( 'showSidebar' )">
        <i class="icon-list"></i>
      </button>
    </div>

    <div class="actionbar-group actionbar-controls" :class="{ 'disabled': !device.id }">
      <button type="button" class="clickable" title="Parent" v-tooltip @click="selectParent()">
        <i class="icon-left"></i>
      </button>
      <button type="button" class="clickable" title="Reload" v-tooltip @click="reloadPath()">
        <i class="icon-reload"></i>
      </button>
      <button type="button" class="clickable" :class="{ 'text-faded': isfav }" @click="saveFavorite">
        <i class="icon-heart"></i>
      </button>
    </div>

    <div class="actionbar-path text-clip" :class="{ 'disabled': !device.id }">
      <span v-for="step in pathLinks" class="clickable" @click.prevent="selectPath( step.path )">
        /{{ step.link }}
      </span>
    </div>

    <div class="actionbar-group actionbar-menu">
      <dropmenu class="actionbar-menu-dropdown" :class="{ 'disabled': !device.id }">
        <i slot="trigger" class="icon-plus"></i>
        <ul slot="list">
          <li class="clickable" @click="createFolder">
            <i class="icon-folder icon-pr"></i> Create Folder
          </li>
          <li class="clickable" @click="$emit( 'uploadFiles' )">
            <i class="icon-upload icon-pr"></i> Upload Files
          </li>
          <li class="clickable" @click="$emit( 'batchTasks' )">
            <i class="icon-tasks icon-pr"></i> Batch Tasks
          </li>
        </ul>
      </dropmenu>

      <dropmenu class="actionbar-menu-dropdown">
        <i slot="trigger" class="icon-user"></i>
        <ul slot="list">
          <li class="clickable text-primary" @click="$emit( 'showOptions' )">
            <i class="icon-user icon-pr"></i> {{ userdata.name }}
          </li>
          <li class="clickable" @click="$emit( 'showOptions' )">
            <i class="icon-settings icon-pr"></i> Account Info
          </li>
          <li class="clickable" @click="logOut">
            <i class="icon-locked icon-pr"></i> Sign off
          </li>
        </ul>
      </dropmenu>
    </div>

  </div>
</template>

<script>
// sub components
import DropMenu from './DropMenu.vue';
// custom components
import API from '../../common/api';
import Utils from '../../common/utils';
import Ajax from '../scripts/Ajax';
import Prompt from '../scripts/Prompt';

export default {

  // component data
  data() {
    return {
      isfav: false,
    }
  },

  // component props
  props: {
    loggedin: { type: Boolean, default: false, required: false },
    userdata: { type: Object, default: {}, required: false },
    device: { type: Object, default: {}, required: false },
    location: { type: String, default: '', required: false },
    favorites: { type: Array, default: [], required: false },
  },

  // sub components
  components: {
    'dropmenu': DropMenu,
  },

  // computed methods
  computed: {

    // convert current path string into a list of links
    pathLinks() {
      let path  = '';
      let links = [];
      let steps = this.location
        .replace( this.device.path, '' )
        .replace( /^\/+|\/+$/g, '' )
        .replace( /\/\/+/g, '/' )
        .split( '/' );

      steps.forEach( link => {
        path = path + '/' + link;
        links.push( { link, path } );
      });
      return links;
    }
  },

  // watchers
  watch: {

    // when location changes
    location: function() {
      this.toggleFavoriteButton();
    },

    // when favorites list changes
    favorites: function() {
      this.toggleFavoriteButton();
    },
  },

  // custom methods
  methods: {

    // request proxy
    sendRequest( method, endpoint, data ) {
      this.$bus.$emit( 'showSpinner' );

      new Ajax( method, endpoint, {
        data: data,

        error: ( xhr, error ) => {
          this.$bus.$emit( 'showAlert', error, 'error' );
        },
        success: ( xhr, response ) => {
          this.$bus.$emit( 'showAlert', response.message || 'Request successfully.', 'success' );
          this.$emit( 'fetchListing', this.location, true ); // force list reload
        },
        complete: ( xhr, response ) => {
          this.$bus.$emit( 'hideSpinner' );
        },
      });
    },

    // end login session
    logOut( e ) {
      new Prompt({
        title: 'Confirmation',
        confirm: 'This will end your login session, are you sure?',
        acceptText: 'Sign out',
        onAccept: () => {
          this.$bus.$emit( 'endSession' );
        }
      });
    },

    // device not selected
    noDevice() {
      return !device.id;
    },

    // change appearance of the favorites button if current location is saved
    toggleFavoriteButton() {
      this.isfav = false;
      for ( let i = 0; i < this.favorites.length; ++i ) {
        if ( this.favorites[ i ].path === this.location ) {
          this.isfav = true;
          break;
        }
      }
    },

    // select parent path from current location
    selectParent() {
      if ( this.location !== this.device.path ) {
        let parent = this.location.replace( /(\/[^\/]+)$/, '' );
        parent = ( /\:$/.test( parent ) ) ? parent +'/' : parent;
        this.$emit( 'fetchListing', parent );
      }
    },

    // select path relative to current device root
    selectPath( path ) {
      path = String( path || '' ).replace( this.device.path, '' );
      path = ( /\:$/.test( path ) ) ? path +'/' : path;
      this.$emit( 'fetchListing', this.device.path + path );
    },

    // reload same path
    reloadPath() {
      this.$emit( 'fetchListing', this.location, true );
    },

    // prompt for new folder name
    createFolder( e ) {
      new Prompt({
        title: 'Create a New Folder',
        inputText: 'Folder name...',
        acceptText: 'Create',
        forceValue: true,
        onEmpty: ( msg ) => {
          this.$bus.$emit( 'showAlert', 'Please enter a new folder name.', 'warning' );
        },
        onAccept: ( name ) => {
          let newname = Utils.stripName( name ).replace( /\.[\w\-]+$/gi, '' );
          let newpath = Utils.fixPath( this.location +'/'+ newname );

          if ( !newname ) {
            return this.$bus.$emit( 'showAlert', 'Tried to create a new folder without giving a valid new name.', 'warning' );
          }
          this.sendRequest( 'POST', API.create, { path: newpath } );
        },
      });
    },

    // add current path to favorites
    saveFavorite( e ) {
      let favorites = this.favorites.slice( 0 );
      let isDevice = ( this.device.path === this.location || this.device.path +'/' === this.location );
      let favname = isDevice ? this.device.name : this.location.split( '/' ).pop();
      let favtype = isDevice ? 'device' : 'folder';

      for ( let i = 0; i < favorites.length; ++i ) {
        if ( favorites[ i ].path === this.location ) {
          this.$bus.$emit( 'showAlert', 'This location is already saved.', 'success' );
          return;
        }
      }
      favorites.push({
        selected: false,
        name: favname,
        type: favtype,
        path: this.location,
        date: Utils.dateString(),
        device: Object.assign( {}, this.device ),
      });
      this.$emit( 'updateFavorites', favorites );
    },

  },
}
</script>

<style lang='scss'>

.actionbar-wrap {
  @include headerBar;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: stretch;

  .actionbar-group {
    display: flex;
    flex-direction: row;
    align-items: center;

    button {
      display: block;
      margin-right: .5em;
      padding: 0.2em 0;
    }
  }

  .actionbar-toggle {
    display: block;

    @media #{$screenLarge} {
      display: none;
    }
  }

  .actionbar-controls {
    margin-right: 4px;
  }

  .actionbar-path {
    flex: 1;
  }

  .actionbar-menu {
    .actionbar-menu-dropdown {
      margin: 0 0 0 .5em;
    }
  }

}
</style>
