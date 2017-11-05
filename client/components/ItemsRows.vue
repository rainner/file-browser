<template>
  <div class="itemsrows-list">

    <div v-for="(item, index) in listing"
      class="itemsrows-list-item"
      :class="['item-' + item.type, { 'selected': item.selected }]"
      :key="item.name">

      <div class="itemsrows-list-check" :class="{ 'selected': item.selected }">
        <i class="clickable"
          :class="item.selected ? 'icon-close' : 'icon-check'"
          @click.stop="$emit( 'itemSelect', $event, index )">
        </i>
      </div>

      <div class="itemsrows-list-name text-clip clickable" :class="{ 'text-faded': item.protected }" @click="$emit( 'itemOpen', item )">
        <i class="icon-pr" :class="item.icon"></i>
        <span class="itemsrows-list-open">{{ item.name }}</span>
      </div>

      <div class="itemsrows-list-size text-clip text-faded">
        <span>{{ item.size }}</span>
      </div>

      <div class="itemsrows-list-date text-clip text-faded">
        <span>{{ item.modified }}</span>
      </div>

      <div class="itemsrows-list-options">
        <dropmenu>
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
  </div>
</template>

<script>
import DropMenu from './DropMenu.vue';

export default {

  // component props
  props: {
    listing: { type: Array, default: [], required: false },
  },

  // sub components
  components: {
    'dropmenu': DropMenu,
  },

  // custom methods
  methods: {

  },
}
</script>

<style lang="scss">

.itemsrows-list {
  margin-bottom: ( $padSpace * 4 );

  .itemsrows-list-item {
    @include containerBox;
    @include listRow;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0;
    margin: 0 0 $listSpace 0;
    border: 0;

    &.item-folder {
      .itemsrows-list-name {
        color: $colorPrimary;
      }
    }

    &.selected, &.selected:hover {
      background-color: $colorPrimary;
      color: $colorPrimaryText;

      .itemsrows-list-name {
        color: $colorPrimaryText;
      }
    }

    & > div {
      padding: ( $padSpace / 2 ) 0;
      padding-left: $padSpace;
    }

    .itemsrows-list-check {
      position: relative;
      text-align: center;
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

    .itemsrows-list-name {
      flex: 1;
    }

    .itemsrows-list-size {
      display: none;
      min-width: 120px;
      text-align: right;

      @media #{$screenSmall} {
        display: block;
      }
    }

    .itemsrows-list-date {
      display: none;
      min-width: 150px;
      text-align: right;

      @media #{$screenMedium} {
        display: block;
      }
    }

    .itemsrows-list-options {
      padding-right: $padSpace;
      text-align: right;

      .dropdown-menu {
        text-align: left;
      }
    }
  }
}
</style>
