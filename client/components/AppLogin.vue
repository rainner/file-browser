<template>
  <div class="login-wrap fade-in icon-locked icon-bg">
    <div class="login-scroller">
      <div class="login-content">

        <div class="login-inner">
          <h1 class="push-bottom"><i class="icon-file icon-pr"></i> FileBrowser</h1>
          <div class="push-bottom text-faded">
            You must login before you can use this application.
          </div>
          <form class="login-form text-left" action="#" method="post" @submit.prevent="onSubmit">
            <div class="form-row">
              <div class="form-label">Username</div>
              <input class="form-input" type="text" name="username" value="" placeholder="Account username" />
            </div>
            <div class="form-row">
              <div class="form-label">Password</div>
              <input class="form-input" type="password" name="password" value="" placeholder="Account password" />
            </div>
            <div class="form-row">&nbsp;</div>
            <div class="form-row text-center">
              <button class="form-btn bg-primary-hover" type="submit">
                <i class="icon-unlocked icon-pr"></i> Sign in
              </button> &nbsp;
              <button class="form-btn bg-default-hover" type="reset">
                <i class="icon-reload icon-pr"></i> Reset
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
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
  @include contentWrapper;
  height: 100vh;

  .login-scroller {
    @include contentScroller;
    height: 100vh;

    .login-content {
      display: flex;
      flex-direction: column;
      text-align: center;
      height: 100vh;

      .login-inner {
        display: block;
        margin: auto;
        padding: ( $padSpace * 2 ) $padSpace;
        width: 100%;

        @media #{$screenMedium} {
          width: 600px;
        }

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
}

</style>
