<template>
  <div class="itemslist-wrap fade-in icon-list icon-bg">
    <div class="itemslist-scroller" ref="scrollpane">
      <div class="itemslist-content">

        <!-- listing and info/options for selected device/location -->
        <div class="itemslist-controls">

          <!-- toggle selection of all list items -->
          <div class="itemslist-checkall text-nowrap" :class="{ 'disabled': !totalItems() }">
            <i class="icon-pr" :class="allSelected() ? 'icon-close' : 'icon-check'"></i>
            <span class="text-uppercase clickable"
              v-text="allSelected() ? 'Uncheck all' : 'Check all'"
              @click="toggleSelect()">
            </span>
          </div>

          <!-- menu for selected list items -->
          <dropmenu class="push-left" v-if="itemsSelected()">
            <span slot="trigger" class="text-uppercase text-nowrap">
              <i class="icon-down-open icon-pr"></i> Selected
            </span>
            <ul slot="list" class="text-reset">
              <li class="clickable" @click.stop="batchMove()">
                <i class="icon-folder icon-pr"></i> Move
              </li>
              <li class="clickable text-danger" @click.stop="batchDelete()">
                <i class="icon-trash icon-pr"></i> Delete
              </li>
            </ul>
          </dropmenu>

          <!-- filter items list by search text -->
          <div class="itemslist-search push-left" :class="{ 'disabled': !totalItems() }">
            <dropmenu>
              <span slot="trigger" class="text-uppercase text-clip">
                <i class="icon-down-open icon-pr"></i>
                {{ filterType ? filterType : 'All Files' }}
              </span>
              <ul slot="list">
                <li class="clickable text-reset" @click="filterByType( 'folder' )">
                  <i class="icon-folder icon-pr"></i> Folders
                </li>
                <li class="clickable text-reset" @click="filterByType( 'audio' )">
                  <i class="icon-audio icon-pr"></i> Audio files
                </li>
                <li class="clickable text-reset" @click="filterByType( 'image' )">
                  <i class="icon-image icon-pr"></i> Image files
                </li>
                <li class="clickable text-reset" @click="filterByType( 'video' )">
                  <i class="icon-movie icon-pr"></i> Video files
                </li>
                <li class="clickable text-reset" @click="filterByType( 'application' )">
                  <i class="icon-code icon-pr"></i> Applications
                </li>
                <li class="clickable text-reset text-danger" @click="clearFilters">
                  <i class="icon-close icon-pr"></i> Clear filter
                </li>
              </ul>
            </dropmenu>
            <input type="text" class="text-uppercase" v-model="filterText" placeholder="Search..." />
          </div>

          <!-- change list style -->
          <div class="itemslist-toggle push-left">
            <span class="text-uppercase clickable" :class="{ 'disabled': listComp == 'itemsgrid' }" @click="setListType( 'itemsgrid' )" title="Grid" v-tooltip>
              <i class="icon-grid icon-pl"></i>
            </span>
            <span class="text-uppercase clickable" :class="{ 'disabled': listComp == 'itemsrows' }" @click="setListType( 'itemsrows' )" title="List" v-tooltip>
              <i class="icon-list icon-pl"></i>
            </span>
          </div>
        </div>

        <!-- fallback message if path is empty -->
        <div class="itemslist-empty" v-if="!totalItems()">
          <i class="icon-help icon-pr"></i> This folder is empty.
        </div>

        <!-- fallback message if filter text found nothing -->
        <div class="itemslist-empty" v-if="totalItems() && !totalFiltered()">
          <i class="icon-help icon-pr"></i>
          Not matches found for the applied filters: &nbsp;
          <span v-if="filterType" class="text-warning">{{ filterType }} types</span>
          <span v-if="filterText" class="text-warning">with {{ filterText }}</span>
        </div>

        <!-- current listing rows/columns -->
        <component
          v-if="totalFiltered()"
          :is="listComp"
          :listing="filteredListing()"
          @itemSelect="itemSelect"
          @itemOpen="itemOpen"
          @itemMedia="itemMedia"
          @itemRename="itemRename"
          @itemCopy="itemCopy"
          @itemMove="itemMove"
          @itemDelete="itemDelete">
        </component>

      </div>
    </div>

    <!-- scroller button -->
    <div class="itemslist-upbtn bg-primary-hover clickable" :class="{ 'cloaked': isTop }" @click.stop="backToTop( true )">
      <i class="icon-up"></i>
    </div>

  </div>
</template>

<script>
// sub domponents
import ItemsRows from './ItemsRows.vue';
import ItemsGrid from './ItemsGrid.vue';
import DropMenu from './DropMenu.vue';
// custom modules
import API from '../../common/api';
import Utils from '../../common/utils';
import Ajax from '../scripts/Ajax';
import Prompt from '../scripts/Prompt';
import Scroller from '../scripts/Scroller';

export default {

  // component data
  data() {
    return {
      selected: false,    // toggle for selecting all items
      totalSelected: 0,   // number of current selected items
      lastSelected: -1,   // index of last item check (for shift selection)
      filterText: '',     // filter list by custom text
      filterType: '',     // filter list by a file type
      listComp: '',       // list type component (rows, grid)
      thumbList: [],      // list of items to have thumbnails processed
      isTop: true,        // scroll position at top of list
      busy: false,        // network status
    }
  },

  // component props
  props: {
    device: { type: Object, default: {}, required: false },
    location: { type: String, default: '/', required: false },
    listing: { type: Array, default: [], required: false },
  },

  // sub components
  components: {
    'itemsrows': ItemsRows,
    'itemsgrid': ItemsGrid,
    'dropmenu': DropMenu,
  },

  // watchers
  watch: {

    // scroll back to top when location changes
    location: function() {
      this.backToTop();
    },

    // update thumbnail queue when list changes
    listing: function() {
      this.fetchThumbs();
    },
  },

  // custom methods
  methods: {

    // request proxy
    sendRequest( method, endpoint, data ) {
      this.$bus.$emit( 'showSpinner' );

      new Ajax( method, endpoint, {
        data: data,

        error: ( xhr, error ) => {
          this.$bus.$emit( 'showAlert', error, 'error' );
        },
        success: ( xhr, response ) => {
          this.$bus.$emit( 'showAlert', response.message || 'Request successfully.', 'success' );
          this.$emit( 'fetchListing', this.location, true ); // force list reload
        },
        complete: ( xhr, response ) => {
          this.$bus.$emit( 'hideSpinner' );
        },
      });
    },

    // select a given path
    selectPath( location ) {
      this.$emit( 'fetchListing', location );
    },

    // get formatted device sizes info
    deviceSizes() {
      return this.device.size + ' Size / ' + this.device.free + ' Free';
    },

    // filter current listing based on filterText value
    filteredListing() {
      let list = this.listing;

      if ( this.filterText ) {
        list = list.filter( item => {
          return item.name.toLowerCase().indexOf( this.filterText.toLowerCase() ) > -1;
        });
      }
      if ( this.filterType ) {
        list = list.filter( item => {
          return item.type === this.filterType;
        });
      }
      return list;
    },

    // apply list filter by type
    filterByType( type ) {
      this.filterType = type || '';
    },

    // clear applied filters
    clearFilters() {
      this.filterText = '';
      this.filterType = '';
    },

    // get number of items after being filtered
    totalFiltered() {
      return this.filteredListing().length;
    },

    // get number of items availale
    totalItems() {
      return this.listing.length;
    },

    // return live count of selected list items (checked)
    selectedCount() {
      let listing = this.filteredListing();
      return listing.filter( item => {
        return item.selected;
      }).length;
    },

    // returns true if there are items checked
    itemsSelected() {
      return ( this.selectedCount() > 0 );
    },

    // returns true if all items are checked
    allSelected() {
      let listing = this.filteredListing();
      let selected = this.selectedCount();
      return ( selected && selected === listing.length );
    },

    // get list item paths for selected items
    getSelectedItems() {
      let listing = this.filteredListing();
      let output = [];

      for ( var i = 0; i < listing.length; ++i ) {
        if ( listing[ i ].selected ) {
          output.push( listing[ i ].path );
        }
      }
      return output;
    },

    // toggle selection of all list items
    toggleSelect() {
      let listing = this.filteredListing();

      this.selected = !this.selected;
      this.totalSelected = this.selected ? listing.length : 0;
      this.lastSelected = -1;

      for ( var i = 0; i < listing.length; ++i ) {
        listing[ i ].selected = this.selected;
      }
    },

    // toggle select single item, check if all items have been manually selected
    itemSelect( e, index ) {
      let listing = this.filteredListing();
      let start   = Math.min( index, this.lastSelected );
      let stop    = Math.max( index, this.lastSelected );

      this.totalSelected = 0;

      for ( var i = 0; i < listing.length; ++i ) {
        let item = listing[ i ];

        if ( index === i ) {
          item.selected = !item.selected;
        }
        if ( e.shiftKey && this.lastSelected !== -1 && this.totalSelected > 0 && i >= start && i <= stop ) {
          item.selected = true;
        }
        if ( item.selected ) {
          this.totalSelected++;
        }
      }
      this.selected = ( this.totalSelected === this.listing.length );
      this.lastSelected = ( this.totalSelected ) ? index : -1;
    },

    // open item
    itemOpen( item ) {
      if ( item.type === 'folder' ) {
        return this.$emit( 'fetchListing', item.path );
      }
      this.$emit( 'openItem', item );
    },

    // trigger modal for video media file types (movie/tv)
    itemMedia( type, item ) {
      this.$emit( 'videoItem', type, item );
    },

    // check item paths before renaming or moving
    itemCheckMove( oldpath, newpath ) {
      oldpath = Utils.fixPath( oldpath );
      newpath = Utils.fixPath( newpath );

      if ( !oldpath || !newpath || oldpath === newpath || oldpath === '/' || newpath === '/' ) {
        return this.$bus.$emit( 'showAlert', 'Must provide valid paths to rename or move an item.', 'warning' );
      }
      if ( oldpath === this.device.path || newpath === this.device.path ) {
        return this.$bus.$emit( 'showAlert', 'Paths must not be same as current device path.', 'warning' );
      }
      if ( oldpath === this.location || newpath === this.location ) {
        return this.$bus.$emit( 'showAlert', 'Paths must not be same as current location path.', 'warning' );
      }
      this.sendRequest( 'POST', API.move, { path: oldpath, newpath: newpath } );
    },

    // prompt for new item name
    itemMove( item ) {
      new Prompt({
        title: 'Move ' + ( item.type === 'folder' ? 'Folder' : 'File' ),
        value: item.path,
        inputText: 'New path...',
        acceptText: 'Move',
        forceValue: true,
        onEmpty: ( msg ) => {
          this.$bus.$emit( 'showAlert', 'Please enter a new path.', 'warning' );
        },
        onAccept: ( newpath ) => {
          this.itemCheckMove( item.path, newpath );
        },
      });
    },

    // prompt for new item name
    itemRename( item ) {
      new Prompt({
        title: 'Rename ' + ( item.type === 'folder' ? 'Folder' : 'File' ),
        value: item.name,
        inputText: 'New name...',
        acceptText: 'Rename',
        forceValue: true,
        onEmpty: ( msg ) => {
          this.$bus.$emit( 'showAlert', 'Please enter a new name.', 'warning' );
        },
        onAccept: ( newname ) => {
          this.itemCheckMove( item.path, this.location +'/'+ newname );
        },
      });
    },

    // prompt for confirmation
    itemCopy( item ) {
      new Prompt({
        title: 'Confirmation',
        confirm: 'This ' + ( item.type === 'folder' ? 'Folder' : 'File' ) + ' will be copied, are you sure?',
        acceptText: 'Copy',
        onAccept: () => {
          let itempath = Utils.fixPath( item.path );

          if ( !itempath || itempath === '/' || itempath === this.device.path || itempath === this.location ) {
            return this.$bus.$emit( 'showAlert', 'Could not copy the specified item.', 'warning' );
          }
          this.sendRequest( 'POST', API.copy, { path: itempath } );
        }
      });
    },

    // prompt for confirmation
    itemDelete( item ) {
      new Prompt({
        title: 'Confirmation',
        confirm: 'This ' + ( item.type === 'folder' ? 'Folder' : 'File' ) + ' will be deleted, are you sure?',
        acceptText: 'Delete',
        onAccept: () => {
          let itempath = Utils.fixPath( item.path );

          if ( !itempath || itempath === '/' || itempath === this.device.path || itempath === this.location ) {
            return this.$bus.$emit( 'showAlert', 'Could not delete the specified item.', 'warning' );
          }
          this.sendRequest( 'POST', API.delete, { path: itempath } );
        }
      });
    },

    // prompt for new path
    batchMove() {
      let items = this.getSelectedItems();

      new Prompt({
        title: 'Move selected items',
        value: this.location,
        inputText: 'New path...',
        acceptText: 'Move ('+ items.length +')',
        forceValue: true,
        onEmpty: ( msg ) => {
          this.$bus.$emit( 'showAlert', 'Please enter a new path.', 'warning' );
        },
        onAccept: ( newpath ) => {
          newpath = Utils.fixPath( newpath );

          if ( !items.length ) {
            return this.$bus.$emit( 'showAlert', 'Please select some list items to be moved.', 'warning' );
          }
          if ( !newpath || newpath === '/' || newpath === this.location ) {
            return this.$bus.$emit( 'showAlert', 'Please select a valid new path to move the selected items to.', 'warning' );
          }
          this.sendRequest( 'POST', API.batch, { action: 'move', path: newpath, items: items } );
        },
      });
    },

    // prompt for new path
    batchDelete() {
      let items = this.getSelectedItems();

      new Prompt({
        title: 'Confirmation',
        confirm: 'The selected items will be deleted, are you sure?',
        acceptText: 'Delete ('+ items.length +')',
        onAccept: () => {
          this.sendRequest( 'POST', API.batch, { action: 'delete', items: items } );
        }
      });
    },

    // send list to server for processing and update items with result
    fetchThumbs() {
      let list = [];

      if ( this.listComp === 'itemsgrid' ) {
        for ( let i = 0; i < this.listing.length; ++i ) {
          let item = this.listing[ i ];
          if ( item.type === 'image' && !item.thumbnail ) {
            list.push( { index: i, path: item.path } );
          }
        }
      }

      if ( this.busy || !list.length ) return;
      this.busy = true;

      new Ajax( 'POST', API.thumbs, {
        data: { list },
        complete: ( xhr, response ) => { this.busy = false; },
        success: ( xhr, response ) => {
          if ( response.data && response.data.list ) {
            for ( let i = 0; i < response.data.list.length; ++i ) {
              let index = response.data.list[ i ].index;
              let thumb = response.data.list[ i ].thumb || '';
              if ( thumb ) this.listing[ index ].thumbnail = thumb;
            }
          }
        },
      });
    },

    // change list type
    setListType( type ) {
      if ( type && typeof type === 'string' ) {
        localStorage.setItem( 'listtype', type );
        this.listComp = type;
      }
    },

    // scroll list back to top
    backToTop( animated ) {
      let scrollpane = this.$refs.scrollpane;
      let scrollpos  = scrollpane.scrollTop || 0;
      let scrollto   = 0;

      if ( !animated ) {
        scrollpane.scrollTop = scrollto;
        return;
      }
      new Scroller( scrollpane, scrollto );
    },

    // monitor list scroll position
    onScroll( e ) {
      let sp = e.target.scrollTop || 0;

      if ( sp > 100 ) {
        this.isTop = false;
        return;
      }
      this.isTop = true;
    },
  },

  // on mounted
  mounted() {
    let scrollpane = this.$refs.scrollpane;
    scrollpane.addEventListener( 'scroll', this.onScroll, false );
    this.listComp = localStorage.getItem( 'listtype' ) || 'itemsrows';
  },

  // on before destroyed
  beforeDestroy() {
    let scrollpane = this.$refs.scrollpane;
    scrollpane.removeEventListener( 'scroll', this.onScroll, false );
  },
}
</script>

<style lang='scss'>

.itemslist-wrap {
  @include contentWrapper;

  .itemslist-scroller {
    @include contentScroller;

    .itemslist-content {
      margin: 0;
      padding: $padSpace;

      .itemslist-controls {
        @include smallHeading;
        color: darken( $colorDocument, 40% );

        .itemslist-search {
          display: none;
          flex-direction: row;
          align-items: center;

          @media #{$screenMedium} {
            display: flex;
          }
          input {
            display: block;
            margin: 0 0 0 .5em;
            padding: 0;
            line-height: 1.4em;
            width: 200px;
            border-top: 1px $lineStyle transparent;
            border-bottom: 1px $lineStyle $lineColor;
            color: $colorSecondary;

            &:focus {
              border-bottom-color: $colorPrimary;
            }
          }
        }
      }

      .itemslist-empty {
        @include containerBox;
        color: darken( $colorDocument, 40% );
      }
    }
  }

  .itemslist-upbtn {
    position: absolute;
    left: 50%;
    bottom: $padSpace;
    transform: translateX( -50% );
    line-height: 1em;
    padding: $padSpace;
    border-radius: 100px;
    box-shadow: $shadowBold;
  }
}
</style>
