<template>
  <div class="dropdown-menu" ref="menu" @mouseup="listHide" @mouseleave="listHide">
    <div class="dropdown-trigger clickable" ref="trigger" @click="listShow">
      <slot name="trigger"></slot>
    </div>
    <div class="dropdown-list" :class="{ 'visible': visible, 'top': top, 'right': right, 'bottom': bottom, 'left': left }">
      <slot name="list"></slot>
    </div>
  </div>
</template>

<script>
import Viewport from '../scripts/Viewport';

export default {

  // component data
  data() {
    return {
      visible: false,
      top: true,
      right: false,
      bottom: false,
      left: true,
    }
  },

  // custom methods
  methods: {

    // show dropdown
    listShow( e ) {
      if ( !this.visible ) {
        // get position of the trigger and window size
        let trigger  = this.$refs.trigger;
        let box      = trigger.getBoundingClientRect();
        let posx     = box.left + ( trigger.offsetWidth / 2 );
        let posy     = box.top + ( trigger.offsetHeight / 2 );
        let centerx  = Viewport.clientWidth() / 2;
        let centery  = Viewport.clientHeight() / 2;
        // menu show position depends on trigger position in relation to window center
        this.top     = ( posy < centery ) ? true : false;
        this.right   = ( posx > centerx ) ? true : false;
        this.bottom  = ( posy > centery ) ? true : false;
        this.left    = ( posx < centerx ) ? true : false;
        this.visible = true;
      }
    },

    // hide dropdown
    listHide( e ) {
      this.visible = false;
    },

  }
}
</script>

<style lang='scss'>

@keyframes dropShow {
    0% { transform: translateY( 20px ); opacity: 0; }
  100% { transform: translateY( 0 ); opacity: 1; }
}

.dropdown-menu {
  display: inline-block;
  overflow: visible;
  position: relative;

  & > .dropdown-trigger {
    display: inline-block;
    cursor: pointer;
  }

  & > .dropdown-list {
    display: none;
    position: absolute;
    overflow: hidden;
    text-align: left;
    margin: 0;
    padding: ( $padSpace / 2 ) 0;
    min-width: 100%;
    max-width: 400px;
    border-left: $lineWidth $lineStyle $colorPrimary;
    background-color: lighten( $colorDocument, 10% );
    border-radius: $lineJoin;
    box-shadow: $shadowBold;
    animation: dropShow $fxSpeed $fxEaseBounce forwards;
    z-index: 999;

    &.visible {
      display: block;
    }
    &.left { // show from left
      left: 0;
      right: auto;
    }
    &.right { // show from right
      left: auto;
      right: 0;
    }
    &.top { // show from top
      top: 50%;
      bottom: auto;
    }
    &.bottom { // show from bottom
      top: auto;
      bottom: 50%;
    }

    ul {
      display: block;
      list-style: none;
      margin: 0;
      padding: 0;

      // dropdown list item
      & > li {
        display: block;
        margin: 0;
        padding: ( $padSpace / 2 ) $padSpace;
        white-space: nowrap;
        @include listRow;

        input {
          padding: 0;
          border-radius: 0;
          background-color: transparent;
          box-shadow: none;
          line-height: 2em;
        }
      }

    }
  }
}

</style>
