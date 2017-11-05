<template>
  <div class="app-wrap">

    <!-- right column -->
    <main class="app-main">

      <!-- content top-bar with options -->
      <actionbar
        :loggedin="loggedin"
        :userdata="userdata"
        :device="device"
        :location="location"
        :favorites="favorites"
        @showWelcome="showWelcome"
        @showOptions="showOptions"
        @showSidebar="toggleSidebar( true )"
        @fetchListing="fetchListing"
        @updateFavorites="updateFavorites"
        @uploadFiles="uploadFiles"
        @batchTasks="batchTasks">
      </actionbar>

      <!-- main app component view -->
      <component
        :is="mainComp"
        :loggedin="loggedin"
        :userdata="userdata"
        :device="device"
        :location="location"
        :listing="listing"
        @showSidebar="toggleSidebar( true )"
        @showWelcome="showWelcome"
        @showOptions="showOptions"
        @selectDevice="selectDevice"
        @fetchListing="fetchListing"
        @openItem="openItem"
        @videoItem="videoItem">
      </component>

    </main>

    <!-- sidebar column -->
    <aside class="app-left" :class="{ 'visible': sidebar }">
      <div class="app-sidebar">

        <!-- sidebar logo -->
        <logobar
          @logoClick="showWelcome"
          @closeSidebar="toggleSidebar( false )">
        </logobar>

        <!-- main sidebar with folders and devices -->
        <sidebar
          :devices="devices"
          :device="device"
          :favorites="favorites"
          @fetchDevices="fetchDevices"
          @loadFavorites="loadFavorites"
          @selectDevice="selectDevice"
          @updateFavorites="updateFavorites">
        </sidebar>

      </div>
    </aside>

    <!-- common modal component -->
    <modal
      ref="modal"
      @closeModal="closeModal">
        <component
          :is="modalComp"
          :device="device"
          :location="location"
          :item="modalItem"
          @fetchListing="fetchListing">
        </component>
    </modal>

  </div>
</template>

<script>
// sub components
import Welcome from './Welcome.vue';
import Options from './Options.vue';
import SideBar from './SideBar.vue';
import LogoBar from './LogoBar.vue';
import ActionBar from './ActionBar.vue';
import ItemsList from './ItemsList.vue';
import Notify from './Notify.vue';
import Spinner from './Spinner.vue';
// modal components
import Modal from './Modal.vue';
import ItemInfo from './ItemInfo.vue';
import TasksForm from './TasksForm.vue';
import UploadForm from './UploadForm.vue';
import MovieForm from './MovieForm.vue';
import TvShowForm from './TvShowForm.vue';
// custom modules
import API from '../../common/api';
import Utils from '../../common/utils';
import Ajax from '../scripts/Ajax';

/**
 * App export
 */
export default {

  // component data
  data() {
    return {
      devices: [], // list of storage devices from server
      device: {}, // current selected device from devices list
      location: '', // full path to current folder being listed
      favorites: [], // list of saved favorite locations (device + location)
      listing: [], // list of items to be listed from current location
      sidebar: false, // sidebar toggle
      mainComp: '', // main app component view
      modalComp: '', // component selected for modal
      modalItem: {}, // optional item to pass to modal
    }
  },

  // component props
  props: {
    loggedin: { type: Boolean, default: false, required: false },
    userdata: { type: Object, default: {}, required: false },
  },

  // sub components
  components: {
    'welcome': Welcome,
    'options': Options,
    'sidebar': SideBar,
    'logobar': LogoBar,
    'actionbar': ActionBar,
    'itemslist': ItemsList,
    'modal': Modal,
    'iteminfo': ItemInfo,
    'tasksform': TasksForm,
    'uploadform': UploadForm,
    'movieform': MovieForm,
    'tvshowform': TvShowForm,
  },

  // custom methods
  methods: {

    // reset app data
    resetData() {
      this.device = {};
      this.location = '';
      this.listing = [];
    },

    // reset and show welcome screen
    showWelcome() {
      this.resetData();
      this.mainComp = 'welcome';
      window.location.hash = '/home';
    },

    // show user options screen
    showOptions() {
      this.resetData();
      this.mainComp = 'options';
      window.location.hash = '/options';
    },

    // update app state from url hash change
    onHashChange( e ) {
      let hash   = String( window.location.hash || '' ).replace( /^[\#\/\?]+/, '' );
      let data   = hash.split( '/' );
      let action = data.shift() || 'home';

      if ( action === 'home' ) {
        return this.showWelcome();
      }
      if ( action === 'options' ) {
        return this.showOptions();
      }
      if ( action === 'list' && data.length >= 2 ) {
        let device   = decodeURIComponent( data[0] );
        let location = decodeURIComponent( data[1] );
        return this.selectDevice( device, location );
      }
    },

    // fetch list of devices from api
    fetchDevices() {
      this.$bus.$emit( 'showSpinner' );

      new Ajax( 'GET', API.devices, {
        error: ( xhr, error ) => {
          this.$bus.$emit( 'showAlert', error, 'error' );
          this.showWelcome();
        },
        success: ( xhr, response ) => {
          this.devices = response.data || [];
          this.onHashChange();
        },
        complete: ( xhr, response ) => {
          this.$bus.$emit( 'hideSpinner' );
        },
      });
    },

    // select new device by id and optional location
    selectDevice( id, path ) {
      if ( !this.devices.length ) return;
      if ( !id || typeof id !== 'string' ) return;

      let device = this.devices.filter( dev => { return dev.id === id } ).shift();
      if ( !device ) return;

      this.device = device;
      this.fetchListing( path || this.device.path + '/' );
    },

    // fetch items listing from api for a full path
    fetchListing( path, force ) {
      if ( !path || typeof path !== 'string' ) return;
      if ( !force && path === this.location ) return;

      this.toggleSidebar( false );
      this.$bus.$emit( 'showSpinner' );

      new Ajax( 'POST', API.listing, {
        data: {
          path: path,
        },
        error: ( xhr, error ) => {
          this.$bus.$emit( 'showAlert', error, 'error' );
          this.showWelcome();
        },
        success: ( xhr, response ) => {
          this.mainComp = 'itemslist';
          this.listing  = response.data || [];
          this.location = path;
          window.location.hash = '/list/'+ encodeURIComponent( this.device.id ) +'/'+ encodeURIComponent( path );
        },
        complete: ( xhr, response ) => {
          this.$bus.$emit( 'hideSpinner' );
        },
      });
    },

    // show modal to upload files
    uploadFiles() {
      this.showModal( 'Upload Files', 'uploadform' );
    },

    // show modal for batch tasks
    batchTasks() {
      this.showModal( 'Batch Tasks', 'tasksform' );
    },

    // request item data and open it or force download
    openItem( item ) {
      this.showModal( 'File Info', 'iteminfo', item );
    },

    // trigger modal for video media file types (movie/tv)
    videoItem( type, item ) {
      switch ( type ) {
        case 'movie'  : return this.showModal( 'Movie File', 'movieform', item );
        case 'tvshow' : return this.showModal( 'TV Show File', 'tvshowform', item );
      }
    },

    // load saved favorites from user store
    loadFavorites( alert ) {
      let msg = null;
      try {
        let favdata = localStorage.getItem( 'favorites' );
        let favorites = JSON.parse( favdata );

        if ( !Array.isArray( favorites ) || !favorites.length ) {
          msg = [ 'Could not find any favorites data to load.', 'warning' ];
        }
        else {
          this.favorites = favorites;
          msg = [ 'Favorites list loaded successfully.', 'success' ];
        }
      }
      catch ( e ) {
        msg = [ e.message || 'Could not load favorites from local storage.', 'error' ];
      }
      if ( alert && msg ) {
        this.$bus.$emit( 'showAlert', msg[0], msg[1] );
      }
    },

    // update new list of saved favorites in user store
    updateFavorites( favorites ) {
      if ( Array.isArray( favorites ) ) {
        try {
          let favdata = JSON.stringify( favorites );
          localStorage.setItem( 'favorites', favdata );
          this.favorites = favorites;
          this.$bus.$emit( 'showAlert', 'Changes to the favorites list have been saved.', 'success' );
        }
        catch ( e ) {
          this.$bus.$emit( 'showAlert', 'There was a problem saving the favorites to localStorage.', 'error' );
        }
      }
    },

    // toggle the sidebar on mobile
    toggleSidebar( show ) {
      this.sidebar = ( typeof show === 'boolean' ) ? show : false;
    },

    // show modal window
    showModal( title, component, item ) {
      this.$refs.modal.showModal( title || 'Modal Window' );
      this.modalComp = component || '';
      this.modalItem = item || {};
    },

    // on modal close event
    closeModal() {
      setTimeout( () => { this.modalComp = ''; }, 1000 );
    },
  },

  // on mounted
  mounted() {
    window.addEventListener( 'hashchange', this.onHashChange );
    this.loadFavorites();
    this.fetchDevices();
  },

  // on destroyed
  destroyed() {
    window.removeEventListener( 'hashchange', this.onHashChange );
  },
}
</script>

<style lang='scss'>

.app-wrap {
  display: block;
  position: relative;
  height: 100vh;

  .app-main {
    height: 100vh;

    @media #{$screenLarge} {
      margin-left: 300px;
    }
  }

  .app-left {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba( 0, 0, 0, 0 );
    pointer-events: none;
    z-index: 100;

    .app-sidebar {
      display: block;
      width: 300px;
      height: 100%;
      transform: translateX( -310px );
    }
  }

  .app-left.visible {
    background-color: $colorOverlay;
    pointer-events: auto;

    .app-sidebar {
      box-shadow: $shadowBold;
      transform: translateX( 0 );
    }
  }

  @media #{$screenLarge} {
    .app-left,
    .app-left.visible {
      background-color: rgba( 0, 0, 0, 0 );
      pointer-events: none;
    }
    .app-left > .app-sidebar,
    .app-left.visible > .app-sidebar {
      box-shadow: none;
      transform: translateX( 0 );
      pointer-events: auto;
    }
  }

}
</style>
