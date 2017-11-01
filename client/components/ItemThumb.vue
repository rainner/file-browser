<template>
  <div class="itemthumb-wrap clickable" :class="{ 'text-faded': item.protected }" @click="$emit( 'itemOpen', item )">
    <div v-if="item.thumbnail" class="itemthumb-image" :style="{ 'background-image': 'url('+ item.thumbnail +')' }"></div>
    <span v-else class="itemthumb-icon" :class="item.icon"></span>
  </div>
</template>

<script>
export default {

  // component props
  props: {
    item: { type: Object, default: {}, required: true },
  },

  // custom methods
  methods: {

  },
}
</script>

<style lang="scss">

.itemthumb-wrap {
  display: block;
  position: relative;
  text-align: center;
  min-width: 100px;

  .itemthumb-image {
    display: block;
    height: 80px;
    margin: 0 auto;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: contain;
  }

  .itemthumb-icon {
    display: block;
    margin: 0 auto;
    font-size: 3em;
    line-height: 1em;
  }
}
</style>
