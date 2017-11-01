<template>
  <div class="upload-wrap">
    <div class="push-bottom">
      Upload files to the current selected directory.
    </div>

    <label class="upload-dropzone text-clip clickable" @dragover="onDragOver" @dragend="onDragEnd" @drop="onDrop">
      <input type="file" name="files" placeholder="Choose files to upload..." multiple @change="onSelect" />
      <span class="text-faded">
        <i class="icon-upload icon-pr"></i> Click or drop files here.
      </span>
    </label>

    <div class="upload-list" v-if="queue.length">
      <div class="upload-list-item" v-for="(file, index) in queue" :key="file.name">
        <div class="upload-list-progress"
          :class="{ 'error': file.error, 'complete': file.complete }"
          :style="{ 'width': file.progress }">
        </div>
        <div class="upload-list-info">
          <div class="upload-list-name text-clip pad-right"><i class="icon-upload icon-pr"></i> {{ file.name }}</div>
          <div class="upload-list-size text-nowrap">{{ file.size }}</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import API from '../../common/api';
import Utils from '../../common/utils';
import Ajax from '../scripts/Ajax';

export default {

  // component data
  data() {
    return {
      files: [],   // selected files array
      queue: [],   // current upload queue
      index: 0,    // index of current item in queue being uploaded
      busy: false, // curently uploading
    }
  },

  // component props
  props: {
    device: { type: Object, default: {}, required: false },
    location: { type: String, default: '/', required: false },
  },

  // custom methods
  methods: {

    // clear file lists
    clearLists() {
      this.files = [];
      this.queue = [];
      this.index = 0;
    },

    // add file objects to queue lists
    addToList( file ) {
      this.files.push( file );
      this.queue.push({
        name: file.name,
        size: Utils.byteSize( file.size ),
        progress: '0%',
        complete: false,
        error: false,
      });
    },

    // when files are dragged over drop zone
    onDragOver( e ) {
      e.preventDefault();
    },

    // when dragging operation has ended
    onDragEnd( e ) {
      let dt = e.dataTransfer;

      if ( dt.items ) {
        for ( let i = 0; i < dt.items.length; i++ ) {
          dt.items.remove( i );
        }
      } else {
        e.dataTransfer.clearData();
      }
    },

    // on files dropped into dropzone
    onDrop( e ) {
      e.preventDefault();
      if ( this.busy ) return;
      let dt = e.dataTransfer;
      let i = 0;

      this.clearLists();

      if ( dt.items ) {
        for ( i = 0; i < dt.items.length; i++ ) {
          if ( dt.items[ i ].kind == 'file' ) {
            this.addToList( dt.items[ i ].getAsFile() );
          }
        }
      }
      else if ( dt.files ) {
        for ( i = 0; i < dt.files.length; i++ ) {
          this.addToList( dt.files[ i ] );
        }
      }
      this.uploadCurrent();
    },

    // on manual file select
    onSelect( e ) {
      if ( this.busy ) return;
      this.clearLists();
      if ( e.target.files ) {
        for ( let i = 0; i < e.target.files.length; i++ ) {
          this.addToList( e.target.files[ i ] );
        }
      }
      this.uploadCurrent();
    },

    // upload current queue item
    uploadCurrent() {
      let done = this.queue.filter( f => { return f.complete; } ).length;

      if ( !this.files.length ) {
        return this.$bus.$emit( 'showAlert', 'No files selected for upload.', 'warning' );
      }
      if ( done === this.files.length ) {
        this.$emit( 'fetchListing', this.location, true ); // force list reload
        return this.$bus.$emit( 'showAlert', Utils.getNoun( done, 'file', 'files' ) +' uploaded successfully.', 'success' );
      }

      let fd = new FormData();
      fd.append( 'path', this.location );
      fd.append( 'file', this.files[ this.index ] );
      this.busy = true;

      new Ajax( 'POST', API.upload, {
        data: fd,
        error: ( xhr, error ) => {
          this.queue[ this.index ].error = true;
          this.$bus.$emit( 'showAlert', error, 'error' );
        },
        progress: ( xhr, percent ) => {
          this.queue[ this.index ].progress = percent + '%';
        },
        success: ( xhr, response ) => {
          this.queue[ this.index ].complete = true;
          this.index += 1;
          this.uploadCurrent();
        },
        complete: ( xhr, response ) => {
          this.busy = false;
        },
      });
    },

  },
}
</script>

<style lang='scss'>

.upload-wrap {

  .upload-dropzone {
    display: block;
    position: relative;
    padding: 40px $padSpace;
    text-align: center;
    line-height: 1em;
    background-color: rgba( 0, 0, 0, 0.05 );
    border: ( $lineWidth * 2 ) dashed $lineColor;
    border-radius: $lineJoin;
    min-height: 100px;

    &:hover {
      background-color: rgba( 0, 0, 0, 0.02 );
    }

    input {
      display: block;
      position: absolute;
      overflow: hidden;
      visibility: hidden;
      line-height: 1em;
      margin: 0;
      padding: 0;
      left: 0;
      top: 0;
    }
  }

  .upload-list {
    margin-top: $padSpace;

    .upload-list-item {
      position: relative;
      overflow: hidden;
      background-color: rgba( 0, 0, 0, 0.05 );
      border-radius: $lineJoin;
      margin-bottom: $lineWidth;
      padding: 0.5em 1em;
      @include borderAccent;
      border-color: $colorSuccess;

      .upload-list-progress {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        background-color: lighten( $colorSuccess, 30% );
        border-radius: $lineJoin;
        z-index: 1;

        &.complete {
          width: 100% !important;
        }
        &.error {
          width: 100% !important;
          background-color: #ffcccc;
        }
      }

      .upload-list-info {
        display: flex;
        position: relative;
        flex-direction: row;
        align-items: center;
        justify-content: stretch;
        color: darken( $colorSuccess, 20% );
        z-index: 2;

        .upload-list-name {
          flex: 1;
        }

        .upload-list-size {

        }
      }
    }

  }
}
</style>
