<template>
  <div class="welcome-wrap fade-in icon-device icon-bg">
    <div class="welcome-scroller">
      <div class="welcome-content">

        <div class="welcome-inner">
          <h2><i class="icon-file icon-pr"></i> FileBrowser</h2>
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
  @include contentWrapper;

  .welcome-scroller {
    @include contentScroller;

    .welcome-content {
      display: flex;
      flex-direction: column;
      text-align: center;
      height: calc( 100vh - #{$topbarHeight} );

      .welcome-inner {
        display: block;
        margin: auto;
        padding: ( $padSpace * 4 ) $padSpace;
      }
    }
  }
}

</style>
