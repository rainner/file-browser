<template>
  <div class="welcome-wrap">
    <div class="welcome-content">
      <div class="welcome-inner">
        <h2>
          <i class="icon-file icon-pr"></i>FileBrowser
        </h2>
        <hr />
        <p>
          This is a web application for browsing the contents
          of storage devices attached to this server.
        </p>
        <p>
          Available storage devices are listed in the &nbsp;
          <button class="text-pill bg-bright-hover text-secondary-hover" @click.prevent="onClick( 'sidebar' )">
            <i class="icon-list icon-pr"></i> Sidebar
          </button> &nbsp;
          located to the left, along with saved favorite locations.
        </p>
        <p>
          Start by selecting a device from the available
          list to start browsing it's contents.
        </p>
        <hr />
        <p>
          Author: &nbsp;
          <a href="https://rainnerlins.com/" target="_blank">
            <i class="icon-network icon-pr"></i>Rainner Lins
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {

  // custom methods
  methods: {

    // click handler
    onClick( task ) {
      switch( task ) {
        case 'sidebar' : this.$emit( 'showSidebar' );  break;
      }
    },
  },
}
</script>

<style lang='scss'>

.welcome-wrap {
  position: relative;
  height: 100%;

  &:before {
    display: block;
    position: absolute;
    font-family: 'fontello';
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    pointer-events: none;
    left: 50%;
    top: 46%;
    transform: translateX( -50% ) translateY( -50% ) rotate( 12deg );
    font-size: calc( 100vh - 200px );
    content: '\f15c';
    opacity: 0.05;
    z-index: -1;
  }

  .welcome-content {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    overflow-y: auto;
    text-align: center;
    margin: 0;
    padding: 0;
    height: calc( 100% - #{$topbarHeight} );

    .welcome-inner {
      display: block;
      margin: auto;
      padding: $padSpace;
      padding-bottom: ( $padSpace * 4 );
    }
  }
}
</style>
