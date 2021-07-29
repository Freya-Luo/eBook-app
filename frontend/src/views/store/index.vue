<template>
  <div class="store">
    <keep-alive>
      <transition :name="transName">
        <router-view class="child-view" />
      </transition>
    </keep-alive>
  </div>
</template>

<script>
  import { os } from '../../utils/utils'
  export default {
    data() {
      return {
        transName: ''
      }
    },
    computed: {
      os() {
        return os()
      }
    },
    beforeRouteEnter(to, from, next) {
      next(vm => {
        if (to.query.key) {
          vm.menuIndex = parseInt(to.query.key)
        }
      })
    },
    beforeRouteUpdate(to, from, next) {
      if (!this.os.isPc) {
        if (to.meta.key > from.meta.key) {
          this.transName = 'slide-left'
        } else {
          this.transName = 'slide-right'
        }
      }
      next()
    }
  }
  window.onload = function() {
    document.addEventListener('touchstart', function(event) {
      if (event.touches.length > 1) {
        event.preventDefault()
      }
    })
    document.addEventListener('gesturestart', function(e) {
      e.preventDefault()
    })
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .store {
    position: relative;
    z-index: 100;
    width: 100%;
    height: 100%;
    background:#faf3dd;
    overflow: hidden;
    .chile-view {
      width: 100%;
      height: 100%;
      margin: 0 auto;
      min-width: 200px;
      max-width: 800px;
      transform: translate3d(0,0,0);
      &.slide-left-enter, &.slide-right-leave-to {
        transform: translate3d(100%,0,0);
      }
      &.slide-left-leave-to, &.slide-right-enter {
        transform: translate3d(-100%,0,0);
      }
      &.slide-left-enter-active, &.slide-right-leave-active {
        transform: transform .4s linear,opacity .4s linear;
      }
    }
  }
</style>
