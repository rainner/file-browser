<template>
  <div class="spinner-wrap" :class="{ 'visible': visible }">
    <div class="spinner-content" @click.stop="clickSpinner"></div>
  </div>
</template>

<script>
export default {

  // component data
  data() {
    return {
      visible: false,
    }
  },

  // custom methods
  methods: {

    // show the spinner
    showSpinner() {
      this.$emit( 'showSpinner' );
      this.visible = true;
    },

    // hise the spinner
    hideSpinner() {
      this.$emit( 'hideSpinner' );
      this.visible = false;
    },

    // on spinner click
    clickSpinner( e ) {
      this.$emit( 'clickSpinner', e );
    },

  },
}
</script>

<style lang='scss'>

@keyframes showSpinner {
    0% { transform: scale( 1.6 ); }
  100% { transform: rotate( 1 ); }
}
@keyframes spinRight {
    0% { transform: rotate( 0deg ); }
  100% { transform: rotate( 359deg ); }
}
@keyframes spinLeft {
    0% { transform: rotate( 359deg ); }
  100% { transform: rotate( 0deg ); }
}

.spinner-wrap {
  display: none;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: $colorOverlay;
  z-index: $zindexModals;

  &.visible {
    display: flex;
  }

  .spinner-content {
    display: block;
    position: relative;
    cursor: pointer;
    width: 80px;
    height: 80px;
    animation: showSpinner $fxSpeed $fxEase forwards;

    &:before, &:after {
      content: '';
      display: block;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      border: 6px solid $colorBright;
      border-radius: 100%;
      transition: none;
    }
    &:before {
      box-shadow: $shadowDark;
      border-top-color: transparent;
      opacity: 0.9;
      z-index: 2;
      animation: spinRight 1s linear infinite;
    }
    &:after {
      border-top-color: transparent;
      border-bottom-color: transparent;
      opacity: 0.2;
      z-index: 1;
      animation: spinLeft 1.5s linear infinite;
    }
  }

}
</style>
