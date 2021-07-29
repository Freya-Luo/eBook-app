<template>
  <div class="store-home">
    <search-bar></search-bar>
    <flap-card :data="random"></flap-card>
    <scroll :top="scrollTop" @onScroll="onScroll" ref="scroll">
      <div class="banner-wrapper">
        <div class="banner-img" :style="{backgroundImage:`url('${banner}')`}"></div>
      </div>
      <!-- <carousel
        class="banner-wrapper"
        :per-page="1"
        :autoplay="true"
        :autoplayTimeout="5000"
        :speed="800"
        :autoplayDirection="direction"
        :paginationEnabled="false"
        @pageChange="handlePageChange"
      > -->
        <!-- <Slide
          class="banner-img"
          :style="{backgroundImage:`url('${bannerItem}')`}"
          v-for="(bannerItem, bannerIndex) in banner"
          :key="bannerIndex"
        ></Slide> -->
        <!-- <Slide class="banner-img" :style="{backgroundImage:`url('${banner[0]}')`}"></Slide> -->
      <!-- </carousel> -->
      <guess-you-like :data="guessLikes"></guess-you-like>
      <recommend :data="recommend" class="recommend"></recommend>
      <featured
        :data="featured"
        :titleText="$t('home.featured')"
        :btnText="$t('home.seeAll')"
        class="featured"
      ></featured>
      <div class="category-list-wrapper" v-for="(item, index) in categoryList" :key="index">
        <category-book :data="item"></category-book>
      </div>
      <category class="categories" :data="categories"></category>
    </scroll>
  </div>
</template>

<script>
import { Carousel, Slide } from 'vue-carousel'
import SearchBar from '../../components/home/SearchBar'
import Scroll from '../../components/common/Scroll'
import FlapCard from '../../components/home/FlapCard'
import GuessYouLike from '../../components/home/GuessYouLike'
import Recommend from '../../components/home/Recommend'
import Featured from '../../components/home/Featured'
import CategoryBook from '../../components/home/CategoryBook'
import Category from '../../components/home/Category'
import { storeHomeMixin } from '../../utils/mixin'
import { home } from '../../api/store'

export default {
  mixins: [storeHomeMixin],
  components: {
    SearchBar,
    Scroll,
    FlapCard,
    GuessYouLike,
    Recommend,
    Featured,
    CategoryBook,
    Category,
    Carousel,
    Slide
  },
  data() {
    return {
      scrollTop: 94,
      random: null,
      banner: [],
      guessLikes: null,
      recommend: null,
      featured: null,
      categoryList: null,
      categories: null,
      direction: 'forward'
    }
  },
  methods: {
    onScroll(offsetY) {
      this.setOffsetY(offsetY)
      if (offsetY > 0) {
        this.scrollTop = 52
      } else {
        this.scrollTop = 94
      }
      this.$refs.scroll.refresh()
    },
    handlePageChange(i) {
      if (i === this.banner.length - 1) {
        this.direction = 'backward'
      } else if (i === 0) {
        this.direction = 'forward'
      }
    }
  },
  mounted() {
    home().then((response) => {
      if (response && response.status === 200) {
        const data = response.data
        // console.log(data)
        const randIndex = Math.floor(Math.random() * data.random.length)
        this.random = data.random[randIndex]
        this.banner = data.banner
        this.guessLikes = data.guessYouLike
        this.recommend = data.recommend
        this.featured = data.featured
        this.categoryList = data.categoryList
        this.categories = data.categories
      }
    })
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import '../../assets/styles/global';

.store-home {
  width: 100%;
  height: 100%;
  .banner-wrapper {
    width: 100%;
    padding: px2rem(10);
    box-sizing: border-box;
    .banner-img {
      width: 100%;
      height: px2rem(150);
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }
  }
  .recommend {
    margin-top: px2rem(20);
  }
  .featured {
    margin-top: px2rem(20);
  }
  .category-list-wrapper {
    margin-top: px2rem(20);
  }
  .categories {
    margin-top: px2rem(20);
  }
}
</style>
