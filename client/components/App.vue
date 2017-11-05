<template>
  <div class="app-outer">

    <!-- main selected component -->
    <component
      :is="comp"
      :loggedin="loggedin"
      :userdata="userdata">
    </component>

    <!-- common notification component -->
    <notify
      ref="notify"
      @closeAlert="closeAlert">
    </notify>

    <!-- common spinner component -->
    <spinner
      ref="spinner"
      @clickSpinner="clickSpinner">
    </spinner>

  </div>
</template>

<script>
// sub components
import AppLogin from './AppLogin.vue';
import AppMain from './AppMain.vue';
import Notify from './Notify.vue';
import Spinner from './Spinner.vue';
// custom modules
import API from '../../common/api';
import Utils from '../../common/utils';
import Ajax from '../scripts/Ajax';

export default {

  // component data
  data() {
    return {
      comp: '',
      loggedin: false,
      userdata: {},
      recheck: 1000 * 60 * 10,
      busy: false,
      sto: null,
    }
  },

  // sub components
  components: {
    'applogin': AppLogin,
    'appmain': AppMain,
    'notify': Notify,
    'spinner': Spinner,
  },

  // custom methods
  methods: {

    // get user data and loggin status from backend
    fetchUser() {
      if ( this.busy ) return;

      this.showSpinner();
      this.busy = true;

      new Ajax( 'GET', API.user, {

        error: ( xhr, error ) => {
          this.showAlert( error, 'error' );
          this.logout();
        },
        success: ( xhr, response ) => {
          if ( response.data && response.data.loggedin ) {
            this.login( response.data.userdata );
            this.showAlert( 'Welcome back '+ this.userdata.name +', you are signed in.', 'success' );
          } else {
            this.logout();
          }
        },
        complete: ( xhr, response ) => {
          this.hideSpinner();
          this.busy = false;
        },
      });
    },

    // send logout request
    endSession() {
      if ( this.busy ) return;

      this.showSpinner();
      this.busy = true;

      new Ajax( 'GET', API.logout, {

        error: ( xhr, error ) => {
          this.showAlert( error, 'error' );
          this.logout();
        },
        success: ( xhr, response ) => {
          this.showAlert( response.message || 'Request successfully.', 'success' );
          this.logout();
        },
        complete: ( xhr, response ) => {
          this.hideSpinner();
          this.busy = false;
        },
      });
    },

    // start login time tracker
    trackStart() {
      this.trackStop();
      if ( !this.loggedin ) return;

      let now = Date.now();
      let login_time = this.userdata.login_time || 0;
      let login_duration = this.userdata.login_duration || 0;
      let login_elapsed = ( now - login_time );

      // session cookie expired
      if ( login_elapsed > login_duration ) {
        this.showAlert( 'Your login session expired, please login again.', 'error' );
        this.logout();
        return;
      }
      this.sto = setTimeout( this.trackStart, 5000 );
    },

    // stop login time tracker
    trackStop() {
      if ( this.sto ) {
        clearTimeout( this.sto );
        this.sto = null;
      }
    },

    // update user status and data
    updateUser( status, data ) {
      this.loggedin = ( typeof status === 'boolean' ) ? status : false;
      this.userdata = Object.assign( this.userdata, data );
    },

    // change user session state
    login( data ) {
      this.updateUser( true, data );
      this.trackStart();
      this.comp = 'appmain';
    },

    // change user session state
    logout() {
      this.updateUser( false, {} );
      this.trackStop();
      this.comp = 'applogin';
    },

    // show notification alert
    showAlert( message, type, timeout ) {
      if ( this.$refs.notify ) {
        timeout = ( !timeout && type !== 'error' ) ? 3000 : timeout;
        this.$refs.notify.showAlert( message, type, timeout );
      }
    },

    // when an alert is closed
    closeAlert( alert ) {

    },

    // show spinner component
    showSpinner() {
      if ( this.$refs.spinner ) {
        this.$refs.spinner.showSpinner();
      }
    },

    // hide spinner component
    hideSpinner() {
      if ( this.$refs.spinner ) {
        this.$refs.spinner.hideSpinner();
      }
    },

    // when the spinner is clicked
    clickSpinner( e ) {

    },
  },

  // on mounted
  mounted() {
    this.$bus.$on( 'showAlert', this.showAlert );
    this.$bus.$on( 'showSpinner', this.showSpinner );
    this.$bus.$on( 'hideSpinner', this.hideSpinner );
    this.$bus.$on( 'fetchUser', this.fetchUser );
    this.$bus.$on( 'updateUser', this.updateUser );
    this.$bus.$on( 'endSession', this.endSession );
    this.$bus.$on( 'login', this.login );
    this.$bus.$on( 'logout', this.logout );
    this.fetchUser();
  },
}
</script>

<style lang='scss'>
// common app styles
@import '../scss/reset';
@import '../scss/type';
@import '../scss/fontello';
@import '../scss/flexbox';
@import '../scss/forms';
@import '../scss/tooltip';
@import '../scss/prompt';
@import '../scss/common';
@import '../scss/modifiers';
// ...
</style>
