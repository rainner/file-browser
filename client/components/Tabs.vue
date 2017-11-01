<template>
  <div class="tabs-wrap" ref="container" @click.stop="hideDropdown">
    <div class="tabs-toggle" v-if="!inline" @click.stop="toggleDropdown">
      {{ tab.name }} <i class="icon-down-open icon-pl"></i>
    </div>
    <nav class="tabs-nav" :class="{ 'tabs-inline': inline, 'tabs-drop': !inline, 'visible': visible }">
      <button type="button" v-for="(tab, index) in tabs" :class="{ 'active': tab.active }" :key="tab.name" @click="activateTab( index )">
        {{ tab.name }}
      </button>
    </nav>
    <div class="tabs-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {

  // component data
  data() {
    return {
      slides: [],     // content slides
      tabs: [],       // tab buttons
      tab: {},        // active tab object
      inline: false,  // if tabs will be displayed inline (flex-row)
      visible: false, // dropdown tabs visible state
      width: 0,       // computed width taken by all tabs inline
    }
  },

  // custom methods
  methods: {

    // reset local data
    resetData() {
      this.slides = [];
      this.tabs = [];
      this.tab = {};
    },

    // toggle tabs dropdown
    toggleDropdown( e ) {
      if ( this.inline ) return;
      this.visible = !this.visible;
    },

    // show tabs dropdown
    showDropdown( e ) {
      if ( this.inline ) return;
      this.visible = true;
    },

    // hide tabs dropdown
    hideDropdown( e ) {
      if ( this.inline ) return;
      this.visible = false;
    },

    // set active tab
    activateTab( index ) {
      for ( let i = 0; i < this.tabs.length; ++i ) {
        let tab   = this.tabs[ i ];
        let slide = this.slides[ i ];

        if ( index === i ) {
          tab.active = true;
          slide.classList.add( 'active' );
          this.tab = Object.assign( {}, tab );
          continue;
        }
        tab.active = false;
        slide.classList.remove( 'active' );
      }
      this.hideDropdown();
    },

    // calculate total tabs width inline
    calculateWidth() {
      this.width = 0;

      let div = document.createElement( 'div' );
      div.style.position = 'absolute';
      div.style.left = '-1000px';
      div.style.padding = '0 1em 0 0';
      document.body.appendChild( div );

      for ( let i = 0; i < this.tabs.length; ++i ) {
        div.innerHTML = this.tabs[ i ].name;
        this.width += div.clientWidth || 0;
      }
      document.body.removeChild( div );
    },

    // resolse tabs display type (inline, dropdown)
    resolveTabs() {
      let boxWidth = this.$refs.container.offsetWidth || 0;
      this.inline = ( window.innerWidth > 720 && this.width < boxWidth );
    },

    // build tabs from slides
    buildTabs() {
      let count = 0;

      // filter slot elements
      let slots = this.$slots.default.filter( e => {
        return ( e.elm && e.elm instanceof Element );
      });
      // create tabs and slides from slot elements
      for ( let i = 0; i < slots.length; ++i ) {
        let elm = slots[ i ].elm;

        if ( elm.hasAttribute( 'title' ) ) {
          let name   = elm.getAttribute( 'title' );
          let active = elm.hasAttribute( 'active' );
          let clss   = active ? 'active' : 'inactive';

          elm.removeAttribute( 'title' );
          elm.removeAttribute( 'active' );
          elm.setAttribute( 'class', 'tabs-slide fade-in' );

          this.tabs.push( { name, active } );
          this.slides.push( elm );

          if ( active ) this.activateTab( count );
          count++; continue;
        }
        // remove invalid slides
        elm.parentNode.removeChild( elm );
      }
    },
  },

  // on mounted
  mounted() {
    this.buildTabs();
    this.calculateWidth();
    this.resolveTabs();
    window.addEventListener( 'resize', this.resolveTabs );
  },

  // on destroyed
  destroyed() {
    this.resetData();
    window.removeEventListener( 'resize', this.resolveTabs );
  },
}
</script>

<style lang='scss'>

@keyframes showDropMenu {
    0% { transform: scale( 0.5 ); opacity: 0; }
  100% { transform: scale( 1 ); opacity: 1; }
}

.tabs-wrap {
  display: block;
  position: relative;

  .tabs-toggle {
    display: block;
    cursor: pointer;
    padding: 0 0 ( $padSpace / 2 ) 0;
    color: $colorPrimary;
    border-bottom: $lineWidth solid $lineColor;

    &:hover {
      color: lighten( $colorPrimary, 10% );
    }
  }

  .tabs-nav {
    display: block;
    list-style: none;
    margin: 0;
    padding: 0;

    button {
      display: block;
      text-align: center;
      line-height: 1.2em;
      color: $colorGrey;
      @include textClip;

      &:hover {
        color: $colorSecondary;
      }
      &.active {
        color: $colorPrimary;
      }
    }
  }

  .tabs-drop {
    display: none;
    position: absolute;
    padding: ( $padSpace / 2 ) 0;
    left: 0;
    top: 0;
    background-color: lighten( $colorDocument, 20% );
    border-radius: $lineJoin;
    box-shadow: $shadowBold;
    animation: showDropMenu $fxSpeed $fxEaseBounce forwards;
    z-index: 2;

    &.visible {
      display: block;
    }
    button {
      width: 100%;
      text-align: left;
      padding: ( $padSpace / 2 ) $padSpace;
      border-bottom: 1px $lineStyle $lineColor;
      background-color: rgba( 0, 0, 0, 0.0000001 );

      &:last-of-type {
        border: 0;
      }
      &:hover, &.active {
        background-color: rgba( 0, 0, 0, 0.05 );
      }
    }
  }

  .tabs-inline {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: stretch;
    border-bottom: $lineWidth solid $lineColor;

    button {
      flex: 1;
      margin-bottom: -$lineWidth;
      padding: 0 0 ( $padSpace / 2 ) 0;
      border-bottom: $lineWidth solid transparent;

      &.active {
        border-color: $colorSecondary;
      }
    }
  }

  .tabs-content {
    display: block;
    position: relative;
    padding: $padSpace 0 0 0;
    z-index: 1;

    .tabs-slide {
      display: none;
      position: relative;
      margin: 0;
      padding: 0;

      &.active {
        display: block;
      }
    }
  }
}
</style>
