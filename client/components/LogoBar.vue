<template>
  <div class="logobar-wrap">
    <button class="logobar-link clickable" type="button" @click="logoClick">
      <i class="icon-file icon-pr"></i> FileBrowser
    </button>
    <button class="logobar-close clickable" type="button" @click="closeSidebar">
      <i class="icon-close"></i>
    </button>
  </div>
</template>

<script>
export default {

  // custom methods
  methods: {
    logoClick( e ) {
      this.$emit( 'logoClick', e );
    },
    closeSidebar( e ) {
      this.$emit( 'closeSidebar', e );
    }
  },
}
</script>

<style lang='scss'>

.logobar-wrap {
  @include headerBar;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  .logobar-link {
    display: inline-block;
    font-size: 120%;
  }

  .logobar-close {
    display: inline-block;

    @media #{$screenLarge} {
      display: none;
    }
  }
}

</style>

