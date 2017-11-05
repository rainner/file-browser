<template>
  <div class="options-wrap fade-in icon-settings icon-bg">
    <div class="options-scroller">
      <div class="options-content">

        <form action="#" method="post" autocomplete="off" @submit.prevent="saveFormData">
          <h2><i class="icon-user icon-pr"></i> Account Info &amp; Options</h2>
          <hr />
          <div class="form-row text-faded">
            Use this form to update the information for your account.
            Your account user name and password are required to login to this application.
            You can leave the password fields blank to keep your current password,
            otherwise enter a new one twice to change it.
          </div>
          <hr />
          <div class="flex-row flex-top">
            <div class="flex-1" v-if="userdata.id">
              <div class="form-label">Account ID</div>
              <span class="text-primary"><i class="icon-locked icon-pr"></i> {{ userdata.id }}</span>
            </div>
            <div class="push-left" v-if="userdata.created">
              <div class="form-label">Creation Date</div>
              <span class="text-info"><i class="icon-clock icon-pr"></i> {{ getDate( userdata.created ) }}</span>
            </div>
            <div class="push-left" v-if="userdata.modified">
              <div class="form-label">Last Modified</div>
              <span class="text-info"><i class="icon-clock icon-pr"></i> {{ getDate( userdata.modified ) }}</span>
            </div>
          </div>
          <hr />
          <div class="form-row">
            <div class="form-label">Display Name</div>
            <input class="form-input" type="text" name="name" v-model="userdata.name" placeholder="Display name" />
          </div>
          <div class="form-row">
            <div class="form-label">Login Username</div>
            <input class="form-input" type="text" name="username" v-model="userdata.username" placeholder="Login username" />
          </div>
          <div class="form-row">
            <div class="form-label">New Password</div>
            <input class="form-input" type="password" name="password" value="" placeholder="Account password" />
          </div>
          <div class="form-row">
            <div class="form-label">Confirm Password</div>
            <input class="form-input" type="password" name="pw_confirm" value="" placeholder="Confirm password" />
          </div>
          <div class="form-row">&nbsp;</div>
          <div class="form-row">
            <button class="form-btn bg-primary-hover" type="submit">
              <i class="icon-unlocked icon-pr"></i> Save Changes
            </button> &nbsp;
            <button class="form-btn bg-default-hover" type="button" @click="logOut">
              <i class="icon-logout icon-pr"></i> Logout
            </button> &nbsp;
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<script>
// custom components
import API from '../../common/api';
import Utils from '../../common/utils';
import Ajax from '../scripts/Ajax';
import Prompt from '../scripts/Prompt';

export default {

  // component props
  props: {
    loggedin: { type: Boolean, default: false, required: false },
    userdata: { type: Object, default: {}, required: false },
  },

  // custom methods
  methods: {

    // convert timestamp to date string
    getDate( time ) {
      return Utils.dateString( time );
    },

    // process user form
    saveFormData( e ) {
      let form = e.target;

      if ( !form.name.value ) {
        return this.$bus.$emit( 'showAlert', 'Please enter a display name for your account.', 'warning' );
      }
      if ( !form.username.value ) {
        return this.$bus.$emit( 'showAlert', 'Please enter a login username for your account.', 'warning' );
      }
      if ( form.password.value ) {
        if ( !form.pw_confirm.value || form.pw_confirm.value !== form.password.value ) {
          return this.$bus.$emit( 'showAlert', 'The passwords do not match, try again.', 'warning' );
        }
      }
      this.$bus.$emit( 'showSpinner' );

      new Ajax( 'POST', API.user, {
        data: {
          id: this.userdata.id,
          data: {
            name: form.name.value,
            username: form.username.value,
            password: form.password.value,
          }
        },
        error: ( xhr, error ) => {
          this.$bus.$emit( 'showAlert', error, 'error' );
        },
        success: ( xhr, response ) => {
          if ( response && response.data && response.data.id ) {
            this.$bus.$emit( 'login', response.data );
            this.$bus.$emit( 'showAlert', response.message || 'Data saved successfully.', 'success' );
          }
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

  },
}
</script>

<style lang="scss">

.options-wrap {
  @include contentWrapper;

  .options-scroller {
    @include contentScroller;

    .options-content {
      padding: ( $padSpace * 2 ) $padSpace;
    }
  }
}

</style>
