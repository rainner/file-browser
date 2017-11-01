<template>
  <div class="player-wrap clickable">

    <div v-if="isType( 'image' )"
      class="player-image"
      :style="{ 'background-image': 'url('+ getUrl() +')' }"
      @error="onError( $event )">
    </div>

    <div v-else-if="isType( 'audio' )"
      class="player-audio">
      <span class="icon-audio"></span>
      <audio
        preload="auto"
        autoplay="autoplay"
        controls="controls"
        loop="true"
        :src="getUrl()"
        @play="onPlay( $event )"
        @pause="onPause( $event )"
        @ended="onEnd( $event )"
        @error="onError( $event )">
      </audio>
    </div>

    <video v-else-if="isType( 'video' )"
      class="player-video"
      preload="auto"
      autoplay="autoplay"
      controls="controls"
      loop="true"
      :src="getUrl()"
      @play="onPlay( $event )"
      @pause="onPause( $event )"
      @ended="onEnd( $event )"
      @error="onError( $event )">
    </video>

    <div v-else class="player-icon">
      <span :class="item.icon"></span>
    </div>

  </div>
</template>

<script>
import API from '../../common/api';

export default {

  // component data
  data: function() {
    return {
      playing: false,
    };
  },

  // component props
  props: {
    item: { type: Object, default: {}, required: true },
  },

  methods: {

    // check if current item is of given type
    isType() {
      for ( let i = 0; i < arguments.length; ++i ) {
        if ( this.item.type === arguments[ i ] ) return true;
      }
      return false;
    },

    // build item url
    getUrl() {
      return API.open +'/?file='+ encodeURIComponent( this.item.path );
    },

    // on media play event
    onPlay: function( e ) {
      e.preventDefault();
      this.playing = true;
    },

    // on media pause event
    onPause: function( e ) {
      e.preventDefault();
      this.playing = false;
    },

    // on media end event
    onEnd: function( e ) {
      e.preventDefault();
      this.playing = false;
    },

    // on media source error event
    onError: function( e ) {
      e.preventDefault();
      console.log( e );
    },

  },
}
</script>

<style lang='scss'>

.player-wrap {
  display: block;
  position: relative;
  overflow: hidden;
  text-align: center;
  color: #fff;
  background-color: #0f0f0f;
  border-radius: $lineJoin;
  outline: 1px solid transparent;

  .player-image {
    display: block;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: contain;
    height: 320px;
  }

  .player-audio {
    display: block;
    padding: $padSpace;

    span {
      display: block;
      font-size: 100px;
      line-height: 1em;
      margin: 0 0 10px 0;
    }
    audio {
      display: block;
      margin: 0 auto;
      width: auto;
    }
  }

  .player-video {
    display: block;
    margin: 0 auto;
    width: 100%;
    height: 320px;
  }

  .player-icon {
    padding: .6em 0;
    font-size: 100px;
  }
}
</style>