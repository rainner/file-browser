<template>
  <div class="iteminfo-wrap">

    <itemplayer
      class="push-bottom"
      :item="item"
      @itemOpen="itemOpen"
      @itemDownload="itemDownload">
    </itemplayer>

    <div class="iteminfo-row">
      <div class="iteminfo-label">Name:</div>
      <div class="text-primary text-clip"><i class="icon-file icon-pr"></i> {{ item.name }}</div>
    </div>

    <div class="iteminfo-row">
      <div class="iteminfo-label">Location:</div>
      <div class="text-secondary text-clip"><i class="icon-folder icon-pr"></i> {{ item.parent }}</div>
    </div>

    <div class="iteminfo-row">
      <div class="iteminfo-label">Device:</div>
      <div class="text-faded"><i class="icon-device icon-pr"></i> {{ device.name }}</div>
    </div>

    <div class="iteminfo-row">
      <div class="iteminfo-label">Created:</div>
      <div class="text-faded"><i class="icon-clock icon-pr"></i> {{ item.created }}</div>
    </div>

    <div class="iteminfo-row">
      <div class="iteminfo-label">Modified:</div>
      <div class="text-faded"><i class="icon-clock icon-pr"></i> {{ item.modified }}</div>
    </div>

    <div class="iteminfo-row">
      <div class="iteminfo-label">Type:</div>
      <div class="text-faded"><i class="icon-info icon-pr"></i> {{ item.type }}</div>
    </div>

    <div class="iteminfo-row">
      <div class="iteminfo-label">Size:</div>
      <div class="text-success"><i class="icon-download icon-pr"></i> {{ item.size }}</div>
    </div>

    <hr />

    <div class="text-center">
      <button class="form-btn bg-primary-hover" type="button" @click="itemOpen">
        <i class="icon-pr" :class="item.icon"></i> Open {{ item.type }}
      </button> &nbsp;
      <button class="form-btn bg-secondary-hover" type="button" @click="itemDownload">
        <i class="icon-download icon-pr"></i> Download
      </button>
    </div>

  </div>
</template>

<script>
import ItemPlayer from './ItemPlayer.vue';
import API from '../../common/api';

export default {

  // component props
  props: {
    device: { type: Object, default: {}, required: false },
    location: { type: String, default: '/', required: false },
    item: { type: Object, default: {}, required: true },
  },

  // sub components
  components: {
    'itemplayer': ItemPlayer,
  },

  // custom methods
  methods: {

    // build item open/download url
    getUrl( base ) {
      base = String( base || API.open || '' );
      return base +'/?file='+ encodeURIComponent( this.item.path );
    },

    // open item in new tab for streaming
    itemOpen() {
      try {
        window.open( this.getUrl( API.open ), '_blank' );
      }
      catch ( e ) {
        return this.$bus.$emit( 'showAlert', e.message || 'Could not open the file.', 'error' );
      }
    },

    // open item in new tab for downloading/saving
    itemDownload() {
      try {
        window.open( this.getUrl( API.download ), '_blank' );
      }
      catch ( e ) {
        return this.$bus.$emit( 'showAlert', e.message || 'Could not download the file.', 'error' );
      }
    },
  },
}
</script>

<style lang="scss">

.iteminfo-wrap {

  .iteminfo-thumb {
    margin: 0 0 $padSpace 0;
    padding: $padSpace;
    background-color: rgba( 0, 0, 0, 0.08 );
    border-radius: $lineJoin;
  }

  .iteminfo-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: auto;
    margin: 0 auto;

    .iteminfo-label {
      width: 100px;
      flex-shrink: 0;
      text-align: right;
      padding-right: $padSpace;
      color: $colorGrey;
    }
  }
}

</style>
