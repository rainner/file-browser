<template>
  <div class="sidebar-wrap">
    <div class="sidebar-scroller">
      <div class="sidebar-content">

        <div class="sidebar-heading">
          <span class="text-uppercase">
            <i class="icon-desktop icon-pr"></i> Storage Devices &nbsp;
            <span class="text-badge">{{ devices.length }}</span>
          </span>
          <button type="button" class="text-bright-hover" title="Reload" @click.stop="$emit( 'fetchDevices' )" v-tooltip>
            <i class="icon-reload"></i>
          </button>
        </div>

        <ul class="sidebar-list">
          <li v-if="!devices.length" class="sidebar-item disabled">
            <i class="icon-warn icon-pr"></i>
            Could not load list of storage devices from the server.
          </li>
          <li v-for="dev in devices" class="sidebar-item clickable" :class="{ 'active': isDevice( dev.id ) }" @click.stop="selectDevice( dev.id )" :key="dev.name">
            <div class="flex-row flex-bottom flex-space">
              <span class="flex-1 text-clip push-right"><i class="icon-device icon-pr"></i> {{ dev.name }}</span>
              <span class="text-nowrap text-smaller text-faded">&nbsp; {{ dev.size }}</span>
            </div>
            <div class="sidebar-item-graph">
              <div :class="{ 'warn': dev.warn }" :style="{ width: dev.perc }"></div>
            </div>
          </li>
        </ul>

        <div class="sidebar-heading">
          <span class="text-uppercase">
            <i class="icon-heart icon-pr"></i> Saved Favorites &nbsp;
            <span class="text-badge">{{ favorites.length }}</span>
          </span>
          <button type="button" class="text-bright-hover" title="Reload" @click.stop="$emit( 'loadFavorites', true )" v-tooltip>
            <i class="icon-reload"></i>
          </button>
        </div>

        <ul class="sidebar-list">
          <li v-if="!favorites.length" class="sidebar-item disabled">
            <i class="icon-info icon-pr"></i>
            Folders you save as favorite will show up here.
          </li>
          <li v-for="(fav, index) in favorites" class="sidebar-item clickable" @click.stop="selectFavorite( fav.device.id, fav.path )" :key="fav.path">
            <div class="flex-row flex-middle flex-space">
              <span class="flex-1 text-clip push-right"><i class="icon-pr" :class="[ 'icon-' + fav.type ]"></i> {{ fav.name }}</span>
              <button type="button" class="clickable" :class="{ 'icon-down-open': !fav.selected, 'icon-up-open': fav.selected }" title="Details" v-tooltip @click.stop="favToggle( index )"></button>
            </div>
            <div class="sidebar-item-reveal" :class="{ 'expanded': fav.selected }">
              <hr />
              <div class="text-clip text-smaller"><i class="icon-device icon-pr"></i> {{ fav.device.name }}</div>
              <div class="text-clip text-smaller"><i class="icon-folder icon-pr"></i> {{ fav.path }}</div>
              <div class="text-clip text-smaller"><i class="icon-clock icon-pr"></i> {{ fav.date }}</div>
              <hr />
              <button type="button" class="text-pill bg-bright-hover text-danger-hover clickable" @click.stop="removeFavorite( index )">
                <i class="icon-close"></i> Remove
              </button>
            </div>
          </li>
        </ul>

      </div>
    </div>
  </div>
</template>

<script>
import Prompt from '../scripts/Prompt';

export default {

  // component props
  props: {
    devices: { type: Array, default: [], required: false },
    device: { type: Object, default: {}, required: false },
    favorites: { type: Array, default: [], required: false },
  },

  // custom methods
  methods: {

    // check for selected device
    isDevice( id ) {
      return ( id === this.device.id );
    },

    // select device
    selectDevice( id ) {
      this.$emit( 'selectDevice', id );
    },

    // select saved favorite
    selectFavorite( deviceId, location ) {
      this.$emit( 'selectDevice', deviceId, location );
    },

    // remove item from list of favs
    removeFavorite( index ) {
      new Prompt({
        title: 'Confirmation',
        confirm: 'Remove this location from the favorites list?',
        acceptText: 'Delete',
        onAccept: ( value ) => {
          let favorites = [];
          for ( let i = 0; i < this.favorites.length; ++i ) {
            if ( i !== index ) favorites.push( this.favorites[ i ] );
          }
          this.$emit( 'updateFavorites', favorites );
        }
      });
    },

    // expand favorite item
    favExpand( index ) {
      this.favorites[ index ].selected = true;
    },

    // collapse favorite item
    favCollapse( index ) {
      this.favorites[ index ].selected = false;
    },

    // toggle favorite item
    favToggle( index ) {
      for ( let i = 0; i < this.favorites.length; ++i ) {
        if ( i === index ) {
          this.favorites[ i ].selected = !this.favorites[ i ].selected;
          break;
        }
      }
    },

  },
}
</script>

<style lang='scss'>

.sidebar-wrap {
  @include contentWrapper;
  background-color: $colorSecondary;
  color: $colorDocument;

  .sidebar-scroller {
    @include contentScroller;

    .sidebar-content {
      padding: $padSpace;

      .sidebar-heading {
        @include smallHeading;
        color: desaturate( lighten( $colorSecondary, 20% ), 20% );
      }

      .sidebar-list {
        display: block;
        margin: 0 0 ( $padSpace * 2 ) 0;
        list-style: none;

        .sidebar-item {
          display: block;
          position: relative;
          line-height: 1.2em;
          margin: 0 0 $listSpace 0;
          padding: calc( #{$padSpace} - 5px ) $padSpace;
          background-color: desaturate( lighten( $colorSecondary, 10% ), 5% );
          color: desaturate( lighten( $colorSecondary, 60% ), 20% );
          box-shadow: $shadowPaper;
          border-radius: $lineJoin;

          &:hover {
            background-color: desaturate( lighten( $colorSecondary, 8% ), 2% );
          }
          &.active {
            background-color: darken( $colorSecondary, 5% );
            color: desaturate( lighten( $colorSecondary, 40% ), 10% );
          }
          &.disabled {
            line-height: normal;
          }

          .sidebar-item-graph {
            display: block;
            overflow: hidden;
            height: $lineWidth;
            margin: 5px 0 0 0;
            padding: 0;
            background-color: rgba( 0, 0, 0, 0.3 );
            border-radius: $lineJoin;

            & > div {
              display: block;
              height: $lineWidth;
              background-color: lighten( $colorSecondary, 30% );

              &.warn {
                background-color: $colorDanger;
              }
            }
          }

          .sidebar-item-reveal {
            display: block;
            overflow: hidden;
            margin: 0;
            padding: 0;
            max-height: 0;
            color: desaturate( lighten( $colorSecondary, 40% ), 20% );
            transition: max-height $fxSpeed $fxEase;

            & > hr {
              margin: 10px 0;
            }

            &.expanded {
              max-height: 140px;
            }
          }
        }
      }
    }
  }
}

</style>
