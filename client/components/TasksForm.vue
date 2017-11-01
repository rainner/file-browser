<template>
  <div class="tasks-wrap">

    <tabs>

      <section title="Batch Rename" active>
        <p>
          Rename all files located in the current directory using the options listed below.
        </p>
        <hr />
        <form action="#" method="post" @submit.prevent="renamePrompt">
          <input type="hidden" name="path" v-model="location" />
          <div class="form-row">
            <div class="form-label">File Subfolder Options</div>
          </div>
          <div class="form-row">
            <div>
              <label class="form-toggle">
                <input type="checkbox" name="sub_type" checked />
                <span>Create subfolder for file type.</span>
              </label>
            </div>
            <div>
              <label class="form-toggle">
                <input type="checkbox" name="sub_year" />
                <span>Create subfolder for file creation year.</span>
              </label>
            </div>
            <div>
              <label class="form-toggle">
                <input type="checkbox" name="sub_extension" />
                <span>Create subfolder for file extension.</span>
              </label>
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">Filename Prefix Value</div>
            <input class="form-input" type="text" name="name_prefix" value="" placeholder="Prefix value..." />
          </div>
          <div class="form-row">
            <div class="form-label">Filename Suffix Value</div>
            <input class="form-input" type="text" name="name_suffix" value="" placeholder="Suffix value..." />
          </div>
          <div class="form-row">
            <div class="form-label">Filename Separator Character</div>
            <select class="form-input" name="name_separator">
              <option value="-" selected>Dash</option>
              <option value="_">Underscore</option>
              <option value=".">Dot</option>
              <option value=" ">Space</option>
            </select>
          </div>
          <div class="form-row">
            <hr />
            <button type="submit" class="form-btn bg-success-hover" :class="{ 'disabled': busy }">
              <i class="icon-file icon-pr"></i> Rename
            </button> &nbsp;
            <button type="reset" class="form-btn bg-default-hover">
              <i class="icon-reload icon-pr"></i> Reset
            </button>
          </div>
        </form>
      </section>

      <section title="Clean Junk">
        <p>
          Delete folders and files recursively from current directory for checked options below.
        </p>
        <hr />
        <form action="#" method="post" @submit.prevent="cleanupPrompt">
          <input type="hidden" name="path" v-model="location" />
          <div class="form-row">
            <div class="form-label">Cleanup Options</div>
          </div>
          <div class="form-row">
            <div>
              <label class="form-toggle">
                <input type="checkbox" name="empty_folders" />
                <span>Delete empty folders.</span>
              </label>
            </div>
            <div>
              <label class="form-toggle">
                <input type="checkbox" name="hidden_files" />
                <span>Delete hidden junk files.</span>
              </label>
            </div>
            <div>
              <label class="form-toggle">
                <input type="checkbox" name="thumb_files" />
                <span>Delete thumbnail files.</span>
              </label>
            </div>
            <div>
              <label class="form-toggle">
                <input type="checkbox" name="cache_files" />
                <span>Delete cache files.</span>
              </label>
            </div>
            <div>
              <label class="form-toggle">
                <input type="checkbox" name="log_files" />
                <span>Delete .log files.</span>
              </label>
            </div>
            <div>
              <label class="form-toggle">
                <input type="checkbox" name="torrent_files" />
                <span>Delete .torrent files.</span>
              </label>
            </div>
          </div>
          <div class="form-row">
            <hr />
            <button type="submit" class="form-btn bg-danger-hover" :class="{ 'disabled': busy }">
              <i class="icon-trash icon-pr"></i> Delete
            </button> &nbsp;
            <button type="reset" class="form-btn bg-default-hover">
              <i class="icon-reload icon-pr"></i> Reset
            </button>
          </div>
        </form>
      </section>

      <section title="Thumbnails">
        <form action="#" method="post" @submit.prevent="thumbsPrompt">
          <input type="hidden" name="path" v-model="location" />
          <div class="form-row">
            <p>
              This will delete the thumbnails cache database for this application
              that is used to store thumbnail data for image files when viewing them
              in the Grid mode. All cached thumbnail data will be deleted and the cache
              will be re-started from scratch.
            </p>
          </div>
          <div class="form-row">
            <hr />
            <button type="submit" class="form-btn bg-danger-hover" :class="{ 'disabled': busy }">
              <i class="icon-trash icon-pr"></i> Delete
            </button> &nbsp;
            <button type="reset" class="form-btn bg-default-hover">
              <i class="icon-reload icon-pr"></i> Reset
            </button>
          </div>
        </form>
        </form>
      </section>

    </tabs>

  </div>
</template>

<script>
import Tabs from './Tabs.vue';
import API from '../../common/api';
import Ajax from '../scripts/Ajax';
import Prompt from '../scripts/Prompt';

export default {

  // component data
  data() {
    return {
      busy: false,
    }
  },

  // sub components
  components: {
    'tabs': Tabs,
  },

  // component props
  props: {
    device: { type: Object, default: {}, required: false },
    location: { type: String, default: '/', required: false },
    item: { type: Object, default: {}, required: false },
  },

  // custom methods
  methods: {

    // prompt rename form
    renamePrompt( e ) {
      new Prompt({
        title: 'Confirmation',
        confirm: 'This will rename all files in this folder, are you sure?',
        acceptText: 'Rename',
        onAccept: () => {
          this.renameSubmit( e );
        },
      });
    },

    // handle rename form
    renameSubmit( e ) {
      if ( this.busy ) {
        return this.$bus.$emit( 'showAlert', 'Please wait for the current request.', 'warning' );
      }
      this.busy = true;

      new Ajax( 'POST', API.cleanNames, {
        data: this._getFormData( e.target ),

        error: ( xhr, error ) => {
          this.$bus.$emit( 'showAlert', error, 'error' );
        },
        success: ( xhr, response ) => {
          this.$bus.$emit( 'showAlert', response.message || 'Request successful.', 'success' );
          this.$emit( 'fetchListing', this.location, true ); // force list reload
        },
        complete: ( xhr, response ) => {
          this.busy = false;
        },
      });
    },

    // prompt cleanup form
    cleanupPrompt( e ) {
      new Prompt({
        title: 'Confirmation',
        confirm: 'This will delete items within this folder, are you sure?',
        acceptText: 'Delete',
        onAccept: () => {
          this.cleanupSubmit( e );
        },
      });
    },

    // handle cleanup form
    cleanupSubmit( e ) {
      if ( this.busy ) {
        return this.$bus.$emit( 'showAlert', 'Please wait for the current request.', 'warning' );
      }
      this.busy = true;

      new Ajax( 'POST', API.cleanJunk, {
        data: this._getFormData( e.target ),

        error: ( xhr, error ) => {
          this.$bus.$emit( 'showAlert', error, 'error' );
        },
        success: ( xhr, response ) => {
          this.$bus.$emit( 'showAlert', response.message || 'Request successful.', 'success' );
          this.$emit( 'fetchListing', this.location, true ); // force list reload
        },
        complete: ( xhr, response ) => {
          this.busy = false;
        },
      });
    },

    // prompt thumbs form
    thumbsPrompt( e ) {
      new Prompt({
        title: 'Confirmation',
        confirm: 'This will delete all thumbnails created by this app, are you sure?',
        acceptText: 'Delete',
        onAccept: () => {
          this.thumbsSubmit( e );
        },
      });
    },

    // handle thumbs form
    thumbsSubmit( e ) {
      if ( this.busy ) {
        return this.$bus.$emit( 'showAlert', 'Please wait for the current request.', 'warning' );
      }
      this.busy = true;

      new Ajax( 'POST', API.cleanThumbs, {
        data: {},

        error: ( xhr, error ) => {
          this.$bus.$emit( 'showAlert', error, 'error' );
        },
        success: ( xhr, response ) => {
          this.$bus.$emit( 'showAlert', response.message || 'Request successful.', 'success' );
          this.$emit( 'fetchListing', this.location, true ); // force list reload
        },
        complete: ( xhr, response ) => {
          this.busy = false;
        },
      });
    },

    // extract form data
    _getFormData( form ) {
      let data = {};

      if ( form && form.elements ) {
        for ( let i = 0; i < form.elements.length; ++i ) {
          let elm   = form.elements[ i ];
          let name  = elm.name || '';
          let value = elm.value || '';

          if ( !name ) continue;
          if ( /^(checkbox|radio)$/.test( elm.type ) ) {
            value = elm.checked ? 1 : 0;
          }
          data[ name ] = value;
        }
      }
      return data;
    },

  },
}
</script>
