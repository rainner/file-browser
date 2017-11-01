<template>
  <div class="login-wrap">

    <!-- login content -->
    <main class="login-main">
      <div class="login-inner">

        <h1 class="push-bottom">
          <i class="icon-locked icon-pr"></i>FileBrowser
        </h1>

        <div class="push-bottom">
          You must login before you can use this application.
        </div>

        <form class="login-form text-left" action="#" method="post" @submit.prevent="onSubmit">
          <div class="form-row">
            <div class="form-label">Username</div>
            <input class="form-input" type="text" name="username" value="" placeholder="Your username" />
          </div>
          <div class="form-row">
            <div class="form-label">Password</div>
            <input class="form-input" type="password" name="password" value="" placeholder="Your password" />
          </div>
          <div class="form-row">&nbsp;</div>
          <div class="form-row text-center">
            <button class="form-btn bg-success-hover" type="submit">
              <i class="icon-unlocked icon-pr"></i> Sign in
            </button> &nbsp;
            <button class="form-btn bg-default-hover" type="reset">
              <i class="icon-reload icon-pr"></i> Reset
            </button>
          </div>
        </form>

      </div>
    </main>

  </div>
</template>

<script>
// custom modules
import API from '../../common/api';
import Ajax from '../scripts/Ajax';

export default {

  // component props
  props: {
    loggedin: { type: Boolean, default: false, required: false },
    userdata: { type: Object, default: {}, required: false },
  },

  // custom methods
  methods: {

    // handle login form
    onSubmit( e ) {
      let form = e.target;

      if ( !form.username.value ) {
        return this.$bus.$emit( 'showAlert', 'Please enter your username', 'warning' );
      }
      if ( !form.password.value ) {
        return this.$bus.$emit( 'showAlert', 'Please enter your password', 'warning' );
      }
      this.$bus.$emit( 'showSpinner' );

      new Ajax( 'POST', API.login, {
        data: new FormData( form ),

        error: ( xhr, error ) => {
          this.$bus.$emit( 'showAlert', error, 'error' );
          this.$bus.$emit( 'logout' );
        },
        success: ( xhr, response ) => {
          this.$bus.$emit( 'showAlert', response.message || 'Login successful.', 'success' );
          this.$bus.$emit( 'login', response.data );
        },
        complete: ( xhr, response ) => {
          this.$bus.$emit( 'hideSpinner' );
        },
      });
    },
  },

  // on mounted
  mounted() {
    window.location.hash = '';
  },
}
</script>

<style lang="scss">

.login-wrap {
  display: block;
  position: relative;
  overflow: hidden;
  overflow-y: auto;
  height: 100vh;

  &:before {
    display: block;
    position: fixed;
    font-family: 'fontello';
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    pointer-events: none;
    left: 50%;
    top: 50%;
    transform: translateX( -50% ) translateY( -50% ) rotate( 12deg );
    font-size: calc( 100vh - 100px );
    content: '\f15c';
    opacity: 0.05;
    z-index: -1;
  }

  .login-main {
    display: flex;
    flex-direction: column;
    overflow: visible;
    text-align: center;
    margin: 0 auto;
    padding: 0;
    width: 100%;
    max-width: 600px;
    height: 100vh;

    .login-inner {
      display: block;
      margin: auto;
      padding: $padSpace;
      padding-bottom: ( $padSpace * 4 );
      width: 100%;

      .login-form {
        display: block;

        .login-input {
          display: block;
          width: 100%;
        }
      }
    }
  }
}
</style>
