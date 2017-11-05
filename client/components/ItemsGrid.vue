<template>
  <div class="itemsgrid-list">

    <div v-for="(item, index) in listing"
      class="itemsgrid-list-item"
      :class="['item-' + item.type, { 'selected': item.selected }]"
      :key="item.name">

      <itemthumb class="itemsgrid-list-thumb" :item="item" @itemOpen="itemOpen"></itemthumb>

      <div class="itemsgrid-list-name clickable" :class="{ 'text-faded': item.protected }" @click="$emit( 'itemOpen', item )">
        <span class="text-clip">{{ item.name }}</span>
      </div>

      <div class="itemsgrid-list-info text-faded">
        <hr /> {{ item.modified }} <br /> {{ item.size }}
      </div>

      <div class="itemsgrid-list-check" :class="{ 'selected': item.selected }">
        <i class="clickable"
          :class="item.selected ? 'icon-close' : 'icon-check'"
          @click.stop="$emit( 'itemSelect', $event, index )">
        </i>
      </div>

      <dropmenu class="itemsgrid-list-menu">
        <i slot="trigger" class="icon-settings"></i>
        <ul slot="list">
          <li class="clickable" v-if="item.type == 'video'" @click="$emit( 'itemMedia', 'movie', item )">
            <i class="icon-movie icon-pr"></i> Movie
          </li>
          <li class="clickable" v-if="item.type == 'video'" @click="$emit( 'itemMedia', 'tvshow', item )">
            <i class="icon-video icon-pr"></i> Episode
          </li>
          <li class="clickable" @click="$emit( 'itemRename', item )">
            <i class="icon-edit icon-pr"></i> Rename
          </li>
          <li class="clickable" @click="$emit( 'itemCopy', item )">
            <i class="icon-copy icon-pr"></i> Duplicate
          </li>
          <li class="clickable" @click="$emit( 'itemMove', item )">
            <i class="icon-folder icon-pr"></i> Move
          </li>
          <li class="clickable text-danger" @click="$emit( 'itemDelete', item )">
            <i class="icon-trash icon-pr"></i> Delete
          </li>
        </ul>
      </dropmenu>

    </div>

  </div>
</template>

<script>
import ItemThumb from './ItemThumb.vue';
import DropMenu from './DropMenu.vue';

export default {

  // component props
  props: {
    listing: { type: Array, default: [], required: false },
  },

  // sub components
  components: {
    'itemthumb': ItemThumb,
    'dropmenu': DropMenu,
  },

  // custom methods
  methods: {

    // proxy item open event
    itemOpen( item ) {
      this.$emit( 'itemOpen', item );
    },
  },
}
</script>

<style lang="scss">

.itemsgrid-list {
  display: grid;
  grid-template-columns: repeat( auto-fill, minmax( 200px, 1fr ) );
  grid-gap: $listSpace;
  margin-bottom: ( $padSpace * 4 );

  .itemsgrid-list-item {
    @include containerBox;
    position: relative;
    text-align: center;
    border: 0;

    &:hover {
      background-color: lighten( $colorDocument, 6% );
      color: lighten( $colorDocumentText, 4% );
    }

    &.item-folder {
      .itemsgrid-list-thumb,
      .itemsgrid-list-name {
        color: $colorPrimary;
      }
    }

    &.selected, &.selected:hover {
      background-color: $colorPrimary;
      color: $colorPrimaryText;

      .itemsgrid-list-thumb,
      .itemsgrid-list-name {
        color: $colorPrimaryText;
      }
    }

    .itemsgrid-list-thumb {
      margin-bottom: 10px;
    }

    .itemsgrid-list-name {
      text-align: center;

      span {
        display: block;
        margin: 0 auto;
        line-height: 1.4em;
        max-width: calc( 200px - #{$padSpace} * 2 );
      }
    }

    .itemsgrid-list-info {
      font-size: 80%;
      line-height: 1.2em;

      hr {
        margin: 10px 0;
      }
    }

    .itemsgrid-list-check {
      position: absolute;
      text-align: center;
      bottom: $padSpace;
      left: $padSpace;
      color: darken( $colorDocument, 10% );

      &.selected {
        color: $colorPrimaryText;
      }
      & > .icon-check {
        display: inline-block;
        width: 1em;
        height: 1em;
        line-height: 1em;
      }
    }

    .itemsgrid-list-menu {
      position: absolute;
      bottom: $padSpace;
      right: $padSpace;
    }
  }
}

</style>
