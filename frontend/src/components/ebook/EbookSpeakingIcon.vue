<template>
  <transition name="fade">
    <div class="ebook-speaking-icon" :style="style" v-show="menuVisible" @click="onClick">
      <span class="icon-headphone"></span>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
import { ebookMixin } from '../../utils/mixin'
import { realPx } from '../../utils/utils'
import { flatList } from '../../api/store'

export default {
  mixins: [ebookMixin],
  watch: {
    settingVisible(n) {
      if (n >= 0 && n !== 3) {
        this.setSpeakingIconBottom(realPx(148))
      } else {
        this.setSpeakingIconBottom(realPx(58))
      }
    }
  },
  data() {
    return {
      bookItem: null
    }
  },
  computed: {
    style() {
      return {
        bottom: this.speakingIconBottom + 'px'
      }
    }
  },
  methods: {
    onClick() {
      let fileName = this.fileName.split('/')[1]
      if (!this.bookItem) {
        this.findBookFromList(fileName)
      } else {
        let rootFile = this.bookItem.rootFile
        if (rootFile.startsWith('/')) {
          rootFile = rootFile.substring(1, rootFile.length)
        }
        this.$router.push({
          path: '/store/speaking',
          query: {
            fileName: fileName,
            opf: `${process.env.VUE_APP_EPUB_OPF_URL}/${fileName}/${rootFile}`
          }
        })
      }
      this.reset()
    },
    reset() {
      this.setMenuVisible(false)
      this.setSettingVisible(0)
      this.setFontFamilyVisible(false)
      this.setSpeakingIconBottom(realPx(58))
    },
    findBookFromList(fileName) {
      flatList().then((response) => {
        if (response.status === 200) {
          const bookList = response.data.data.filter(
            (item) => item.fileName === fileName
          )
          if (bookList && bookList.length > 0) {
            this.bookItem = bookList[0]
            this.onClick()
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import '../../assets/styles/global';

.ebook-speaking-icon {
  position: absolute;
  bottom: 0;
  right: px2rem(15);
  z-index: 160;
  width: px2rem(50);
  height: px2rem(50);
  background: #3c4049;
  border-radius: 50%;
  transition: bottom 0.2s linear, opacity 0.2s linear;
  @include center;
  .icon-headphone {
    font-size: px2rem(20);
    color: #cfcfcf;
  }
}
</style>
