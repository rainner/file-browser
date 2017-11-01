<template>
  <div class="modal-overlay" :class="{ 'visible': visible, 'under': under }" @click.stop="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <div class="modal-title text-clip">{{ title }}</div>
        <button class="modal-close" @click.stop="closeModal">
          <i class="icon-close"></i>
        </button>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {

  // component data
  data() {
    return {
      title: '',
      visible: false,
      under: true,
    }
  },

  // custom methods
  methods: {

    // show the modal window
    showModal( title ) {
      this.title = title || 'Modal Window';
      this.visible = true;
      this.under = false;
    },

    // close the modal
    closeModal( e ) {
      this.$emit( 'closeModal' );
      this.visible = false;
      setTimeout( () => { this.under = true; }, 500 );
    },

    // check for escape key
    onKey( e ) {
      if ( this.visible && e.keyCode == 27 ) {
        this.closeModal( e );
      }
    },
  },

  // on mounted
  mounted() {
    document.addEventListener( 'keydown', this.onKey );
  },

  // on destroyed
  destroyed() {
    document.removeEventListener( 'keydown', this.onKey );
  },
}
</script>

<style lang='scss'>

.modal-overlay {
  display: block;
  position: fixed;
  overflow: auto;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: $colorOverlay;
  z-index: $zindexModals;
  pointer-events: none;
  opacity: 0;

  .modal-container {
    margin: $padSpace;
    background-color: lighten( $colorDocument, 20% );
    border-radius: $lineJoin;
    @include borderAccent;
    box-shadow: $shadowBold;
    transform: scale( 0.5 );

    @media #{$screenMedium} {
      margin: 100px auto;
      max-width: $sizeMedium;
    }

    .modal-header {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: stretch;
      padding: $padSpace;
      border-bottom: $lineWidth $lineStyle $colorPrimary;

      .modal-title, .modal-close {
        display: inline-block;
        font-size: 120%;
        font-weight: normal;
        text-transform: capitalize;
        line-height: 1.2em;
      }

      .modal-title {
        flex: 1;

      }
      .modal-close {
        cursor: pointer;
        color: $colorPrimary;
      }
    }

    .modal-body {
      display: block;
      padding: $padSpace;
    }
  }
}

.modal-overlay.visible {
  z-index: $zindexModals;
  pointer-events: auto;
  opacity: 1;

  .modal-container {
    transform: scale( 1 );
  }
}

.modal-overlay.under {
  z-index: $zindexUnder;
}

</style>
