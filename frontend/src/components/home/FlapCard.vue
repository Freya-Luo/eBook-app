<template>
  <div class="flap-card-wrapper" v-show="flapCardVisible">
    <div
      class="flap-card-bg"
      :class="{'animation': runFlapCardAnimation}"
      v-show="runFlapCardAnimation"
    >
      <div
        class="flap-card"
        v-for="(item, index) in flapCardList"
        :key="index"
        :style="{zIndex: item.zIndex}"
      >
        <div class="flap-card-circle">
          <div
            class="flap-card-semi-circle flap-card-semi-circle-left"
            :style="semiCircleStyle(item, 'left')"
            ref="left"
          ></div>
          <div
            class="flap-card-semi-circle flap-card-semi-circle-right"
            :style="semiCircleStyle(item, 'right')"
            ref="right"
          ></div>
        </div>
      </div>
      <div class="point-wrapper">
        <div
          class="point"
          :class="{'animation': runPointAnimation}"
          v-for="item in pointList"
          :key="item"
        ></div>
      </div>
    </div>
    <div
      class="book-card"
      :class="{'animation': runBookCardAnimation}"
      v-show="runBookCardAnimation"
    >
      <div class="book-card-wrapper">
        <div class="img-wrapper">
          <img class="img" v-lazy="data ? data.cover : ''" />
        </div>
        <div class="content-wrapper">
          <div class="content-title">{{data ? data.title : ''}}</div>
          <div class="content-author sub-title-medium">{{data ? data.author : ''}}</div>
          <div class="content-category">{{categoryText()}}</div>
        </div>
        <div class="read-btn" @click.stop="showBookDetail(data)">{{$t('home.readNow')}}</div>
      </div>
    </div>
    <div class="close-btn-wrapper" @click="close">
      <div class="icon-close"></div>
    </div>
  </div>
</template>

<script>
import { storeHomeMixin } from '../../utils/mixin'
import { flapCardList, categoryText } from '../../utils/store'
export default {
  mixins: [storeHomeMixin],
  props: {
    data: Object
  },
  data() {
    return {
      flapCardList,
      front: 0,
      back: 1,
      flapInterval: 35,
      pointTime: 750,
     firstShowTime: 300,
       stopTime: 2500,
      pointList: null,
      runFlapCardAnimation: false,
      runBookCardAnimation: false,
      runPointAnimation: false
    }
  },
  watch: {
    flapCardVisible(v) {
      if (v) {
        this.runAnimation()
      }
    }
  },
  methods: {
    close() {
      this.stopAnimation()
      this.setFlapCardVisible(false)
    },
    semiCircleStyle(item, dir) {
      return {
        backgroundColor: `rgb(${item.r},${item.g},${item.b})`,
        backgroundSize: item.backgroundSize,
        backgroundImage: dir === 'left' ? item.imgLeft : item.imgRight
      }
    },
    rotate(index, type) {
      const item = this.flapCardList[index]
      let dom
      if (type === 'front') {
        dom = this.$refs.right[index]
      } else {
        dom = this.$refs.left[index]
      }
      dom.style.transform = `rotateY(${item.rotateDegree}deg)`
      dom.style.backgroundColor = `rgb(${item.r},${item._g},${item.b})`
    },
    flapCardRotate() {
      const front = this.flapCardList[this.front]
      const back = this.flapCardList[this.back]
      front.rotateDegree += 10
      front._g -= 5
      back.rotateDegree -= 10
      if (back.rotateDegree < 90) {
        back._g += 5
      }
      if (front.rotateDegree === 90 && back.rotateDegree === 90) {
        back.zIndex += 2
      }
      this.rotate(this.front, 'front')
      this.rotate(this.back, 'back')
      if (front.rotateDegree === 180 && back.rotateDegree === 0) {
        this.nextSet()
      }
    },
    nextSet() {
      // restore
      const front = this.flapCardList[this.front]
      const back = this.flapCardList[this.back]
      front.rotateDegree = 0
      back.rotateDegree = 0
      front._g = front.g
      back._g = back.g
      this.rotate(this.front, 'front')
      this.rotate(this.back, 'back')
      // next start
      const len = this.flapCardList.length
      this.front++
      this.back++
      if (this.front >= len) {
        this.front = 0
      }
      if (this.back >= len) {
        this.back = 0
      }
      /**
       * z-index
       * 100 - 96
       * 99 - 100
       * 98 - 99
       * 97 - 98
       * 96 - 97
       */
      this.flapCardList.forEach((item, index) => {
        item.zIndex = 100 - ((index - this.front + len) % len)
      })
      this.prepare()
    },
    prepare() {
      // Make the back left side be overlapped with the front right side
      const back = this.flapCardList[this.back]
      back.rotateDegree = 180
      back._g = back.g - 5 * 9
      this.rotate(this.back, 'back')
    },
    startFlapCardAnimation() {
      this.prepare()
      this.task = setInterval(() => {
        this.flapCardRotate()
      }, this.flapInterval)
    },
    startPointAnimation() {
      this.runPointAnimation = true
      setTimeout(() => {
        this.runPointAnimation = false
      }, this.pointTime)
    },
    reset() {
      this.front = 0
      this.back = 1
      this.flapCardList.forEach((item, index) => {
        // restore z-index, color, and initial degreee
        item.zIndex = 100 - index
        item._g = item.g
        item.rotateDegree = 0
        this.rotate(index, 'front')
        this.rotate(index, 'back')
      })
      this.runBookCardAnimation = false
      this.runFlapCardAnimation = false
      this.runPointAnimation = false
    },
    stopAnimation() {
      if (this.task) {
        clearInterval(this.task)
      }
      if (this.task2) {
        clearTimeout(this.task2)
      }
      if (this.task3) {
        clearTimeout(this.task3)
      }
      this.reset()
    },
    runAnimation() {
      this.runFlapCardAnimation = true
      this.task2 = setTimeout(() => {
        this.startPointAnimation()
        this.startFlapCardAnimation()
      }, this.firstShowTime)
      this.task3 = setTimeout(() => {
        this.stopAnimation()
        this.runBookCardAnimation = true
      }, this.stopTime)
    },
    categoryText() {
      if (this.data) {
        return categoryText(this.data.category, this)
      } else {
        return ''
      }
    }
  },
  created() {
    this.pointList = []
    for (let i = 0; i < 18; i++) {
      this.pointList.push(`point${i}`)
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import '../../assets/styles/global';
@import '../../assets/styles/flapCard';

.flap-card-wrapper {
  z-index: 1000;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  @include center;
  @include absCenter;
  .flap-card-bg {
    position: relative;
    width: px2rem(64);
    height: px2rem(64);
    border-radius: px2rem(5);
    background: white;
    transform: scale(0);
    opacity: 0;
    &.animation {
      animation: flap-card-move $firstShowTime ease-in both;
    }
    @keyframes flap-card-move {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.2);
        opacity: 1;
      }
      75% {
        transform: scale(0.8);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    .flap-card {
      width: px2rem(48);
      height: px2rem(48);
      @include absCenter;
      .flap-card-circle {
        display: flex;
        width: 100%;
        height: 100%;
        .flap-card-semi-circle {
          flex: 0 0 50%;
          width: 50%;
          height: 100%;
          background-repeat: no-repeat;
          // When it rotates at the point that back is facing up, x show
          backface-visibility: hidden;
        }
        .flap-card-semi-circle-left {
          border-radius: px2rem(24) 0 0 px2rem(24);
          background-position: center right;
          // transform axis
          transform-origin: right;
        }
        .flap-card-semi-circle-right {
          border-radius: 0 px2rem(24) px2rem(24) 0;
          background-position: center left;
          transform-origin: left;
        }
      }
    }
    .point-wrapper {
      z-index: 1500;
      @include absCenter;
      .point {
        border-radius: 50%;
        @include absCenter;
        &.animation {
          @for $i from 1 to length($moves) {
            &:nth-child(#{$i}) {
              @include move($i);
            }
          }
        }
      }
    }
  }
  .book-card {
    position: relative;
    width: 65%;
    max-width: px2rem(400);
    box-sizing: border-box;
    border-radius: px2rem(15);
    background: white;
    &.animation {
      animation: scale $bookShowTime ease-in both;
      @keyframes scale {
        0% {
          transform: scale(0);
          opacity: 0;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    }
    .book-card-wrapper {
      width: 100%;
      height: 100%;
      margin-bottom: px2rem(30);
      @include columnTop;
      .img-wrapper {
        width: 100%;
        margin-top: px2rem(20);
        @include center;
        .img {
          width: px2rem(90);
          height: px2rem(130);
        }
      }
      .content-wrapper {
        padding: 0 px2rem(20);
        margin-top: px2rem(20);
        .content-title {
          color: #333;
          font-weight: bold;
          font-size: px2rem(18);
          line-height: px2rem(20);
          max-height: px2rem(40);
          text-align: center;
          @include ellipsis2(2);
        }
        .content-author {
          margin-top: px2rem(10);
          text-align: center;
        }
        .content-category {
          color: #999;
          font-size: px2rem(14);
          margin-top: px2rem(10);
          text-align: center;
        }
      }
      .read-btn {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 1100;
        width: 100%;
        border-radius: 0 0 px2rem(15) px2rem(15);
        padding: px2rem(15) 0;
        text-align: center;
        color: white;
        font-size: px2rem(14);
        background: $color-blue;
      }
    }
  }
  .close-btn-wrapper {
    position: absolute;
    left: 0;
    bottom: px2rem(15);
    z-index: 1100;
    width: 100%;
    @include center;
    .icon-close {
      width: px2rem(35);
      height: px2rem(35);
      border-radius: 50%;
      background: #333;
      font-size: px2rem(25);
      color: white;
      @include center;
    }
  }
}
</style>
