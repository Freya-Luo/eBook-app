<template>
  <div class="ebook-reader">
    <div id="read"></div>
    <!-- this.rendition.on('touchmove', e=>{}) touchmove does not exist, so we can have a mask DOM (tricky)
        Bookmark principle: Using touchmove & touchend events to get offsetY value in the vuex store, then the main UI =>
    index.vue can get this value and let the screen to be scrolled down.-->
    <div
      class="ebook-reader-mask"
      @click="onMaskClick"
      @touchmove="move"
      @touchend="moveEnd"
      @mousedown.left="onMouseEnter"
      @mousemove.left="onMouseMove"
      @mouseup="onMouseEnd"
    ></div>
  </div>
</template>

<script>
import { ebookMixin } from '../../utils/mixin'
import Epub from 'epubjs'
import {
  getFontFamily,
  saveFontFamily,
  getFontSize,
  saveFontSize,
  getTheme,
  saveTheme,
  saveMetadata,
  getLocation,
  saveCover
} from '../../utils/localStorage'
import { flatten } from '../../utils/book'
import { getLocalForage } from '../../utils/localForage'

global.ePub = Epub
export default {
  mixins: [ebookMixin],
  methods: {
    /* Why 4 state? -- have to differentiate it with onMouseClick event
                      & only listen to the mouseMove after the mouse has been pressed.
      1: mouse enter (pressed)
      2: mouse move after being pressed
      3: mouse up after state 2
      4: mouse restore */
    onMouseEnter(e) {
      this.mouseState = 1
      this.mouseStartTime = e.timeStamp
      e.preventDefault()
      e.stopPropagation()
    },
    onMouseMove(e) {
      if (this.mouseState === 1) {
        this.mouseState = 2
      } else if (this.mouseState === 2) {
        let offsetY = 0
        if (!this.firstOffsetY) {
          this.firstOffsetY = e.clientY
        } else {
          offsetY = e.clientY - this.firstOffsetY
          this.setOffsetY(offsetY)
        }
      }
      e.preventDefault()
      e.stopPropagation()
    },
    onMouseEnd(e) {
      if (this.mouseState === 2) {
        this.setOffsetY(0)
        this.firstOffsetY = null
        this.mouseState = 3
      } else {
        this.mouseState = 4
      }
      /* To address there might be a minor swift when we click the mouse,
      avoiding this.mouseState to be reset as 3. */
      const time = e.timeStamp - this.mouseStartTime
      if (time < 200) {
        this.mouseState = 4
      }
      e.preventDefault()
      e.stopPropagation()
    },
    move(e) {
      /* Due to the decoupling of different components and vuex store, we only need to set offsetY a value.
         The rest of the work will be done in the watch part of EbookBookmark.vue. Hence, it will automatically
         listen to and then respond the offsetY changing. */
      let offsetY = 0
      if (!this.firstOffsetY) {
        this.firstOffsetY = e.changedTouches[0].clientY
      } else {
        offsetY = e.changedTouches[0].clientY - this.firstOffsetY
        this.setOffsetY(offsetY)
      }
      e.preventDefault()
      e.stopPropagation()
    },
    moveEnd(e) {
      this.setOffsetY(0)
      this.firstOffsetY = null
    },
    onMaskClick(e) {
      /* Do not respond to the mouse move in the PC. touch is for the mobile, mouse is for the PC.
         However, in PC development modex, in iphone devTools, mouse represents finger touch, so we have to differentiate it. */
      if (this.mouseState && (this.mouseState === 2 || this.mouseState === 3)) {
        return
      }
      const offsetX = e.offsetX
      const width = window.innerWidth
      if (offsetX > 0 && offsetX < width * 0.3) {
        this.prevPage()
      } else if (offsetX > 0 && offsetX > width * 0.7) {
        this.nextPage()
      } else {
        this.toggleTittleAndMenu()
      }
    },
    prevPage() {
      if (this.rendition) {
        this.rendition.prev().then(() => {
          this.refreshLocation()
        })
        this.hideTitleAndMenu()
      }
    },
    nextPage() {
      if (this.rendition) {
        this.rendition.next().then(() => {
          this.refreshLocation()
        })
        this.hideTitleAndMenu()
      }
    },
    toggleTittleAndMenu() {
      if (this.menuVisible) {
        this.setSettingVisible(-1)
        this.setFontFamilyVisible(false)
      }
      this.setMenuVisible(!this.menuVisible)
    },
    initTheme() {
      // give initial theme when first load
      let theme = getTheme(this.fileName)
      if (!theme) {
        theme = this.themeList[2].name
        saveTheme(this.fileName, theme)
      }
      this.setDefaultTheme(theme)
      this.themeList.forEach((theme) => {
        this.rendition.themes.register(theme.name, theme.style)
      })
      // vuex calls are asynchronous, so we don't use select(this.defaultTheme)
      this.rendition.themes.select(theme)
    },
    initFontSize() {
      // give the initial(default) font size in the local storage
      let fontSize = getFontSize(this.fileName)
      if (!fontSize) {
        saveFontSize(this.fileName, this.defaultFontSize)
      } else {
        this.rendition.themes.fontSize(fontSize)
        this.setDefaultFontSize(fontSize)
      }
    },
    initFontFamily() {
      // give the initial(default) font family in the local storage
      let font = getFontFamily(this.fileName)
      if (!font) {
        saveFontFamily(this.fileName, this.defaultFontFamily)
      } else {
        this.rendition.themes.font(font)
        // pass into vuex store
        this.setDefaultFontFamily(font)
      }
    },
    initRendition() {
      this.rendition = this.book.renderTo('read', {
        width: innerWidth,
        height: innerHeight,
        method: 'default',
        // flow: 'scrolled',
        manager: 'continuous'
        /* method: 'default' allows it can be rendered in the wechat server
        flow model cannot be perfectly supported in wechat or ios safari. */
      })
      const location = getLocation(this.fileName)
      this.display(location, () => {
        this.initTheme()
        this.initFontSize()
        this.initFontFamily()
        this.initGlobalStyle()
      })
      // this.rendition.display().then(() => {
      //   this.initTheme()
      //   this.initFontSize()
      //   this.initFontFamily()
      //   this.initGlobalStyle()
      //   this.refreshLocation()
      // })
      /* Looking into node_modules/epubjs/src/contents.js ,
       * there is an addStylesheet() which require an URL instead of a path. */
      this.rendition.hooks.content.register((contents) => {
        Promise.all([
          contents.addStylesheet(
            `${process.env.VUE_APP_RES_URL}/fonts/cabin.css`
          ),
          contents.addStylesheet(
            `${process.env.VUE_APP_RES_URL}/fonts/daysOne.css`
          ),
          contents.addStylesheet(
            `${process.env.VUE_APP_RES_URL}/fonts/raleway.css`
          ),
          contents.addStylesheet(
            `${process.env.VUE_APP_RES_URL}/fonts/tangerine.css`
          )
        ]).then(() => {})
      })
    },
    /* initGesture() {
      this.rendition.on('touchstart', (event) => {
        this.touchStartX = event.changedTouches[0].clientX
        this.touchStartTime = event.timeStamp
      })
      this.rendition.on('touchend', (event) => {
        const offsetX = event.changedTouches[0].clientX - this.touchStartX
        const time = event.timeStamp - this.touchStartTime
        if (time < 500 && offsetX > 40) {
          this.prevPage()
        } else if (time < 500 && offsetX < -40) {
          this.nextPage()
        } else {
          this.toggleTittleAndMenu()
        }
        event.stopPropagation()
      })
    }, */
    parseBook() {
      this.book.loaded.metadata.then((metadata) => {
        this.setMetadata(metadata)
        saveMetadata(this.fileName, metadata)
      })
      // For getting information in the EbookSlideConetent
      this.book.loaded.cover.then((cover) => {
        this.book.archive.createUrl(cover).then((url) => {
          this.setCover(url)
        })
      })
      this.book.loaded.navigation.then((nav) => {
        // nav is an object, contents are stored inside the .toc property (multi-dimen array)
        const navItems = flatten(nav.toc)
        function findLevel(item, level = 0) {
          const parent = navItems.filter(
            (parentItem) => parentItem.id === item.parent
          )[0]
          return !item.parent
            ? level
            : parent
            ? findLevel(parent, ++level)
            : level
        }
        navItems.forEach((item) => {
          item.level = findLevel(item)
          item.total = 0
          item.pageList = []
          if (item.href.match(/^(.*)\.html$/)) {
            item.idhref = item.href.match(/^(.*)\.html$/)[1]
          } else if (item.href.match(/^(.*)\.xhtml$/)) {
            item.idhref = item.href.match(/^(.*)\.xhtml$/)[1]
          }
        })
        this.setNavigation(navItems)
      })
      /* .ready hook function => book has already been resolved */
      this.book.ready
        .then(() => {
          return this.book.locations.generate(
            750 *
              (window.innerWidth / 375) *
              (parseInt(getFontSize(this.fileName), 10) / 16)
          )
        })
        .then((locations) => {
          locations.forEach((location) => {
            const loc = location.match(/\[(.*)\]!/)[1]
            this.navigation.forEach((nav) => {
              // xxxx.html, href in navigation is equal to the epubcfi[...] 's content
              if (nav.idhref && nav.idhref.indexOf(loc) >= 0) {
                nav.pageList.push(location)
              }
            })
            let currentPage = 1
            this.navigation.forEach((nav, index) => {
              if (index === 0) {
                nav.page = 1
              } else {
                nav.page = currentPage
              }
              currentPage += nav.pageList.length + 1
            })
          })
          this.setPagelist(locations)
          this.setBookAvailable(true)
          this.setIsPaginating(false)
          this.refreshLocation()
        })
    },
    showEpub(url) {
      // Adding cached-reading functionality
      /* const url =
         process.env.VUE_APP_RES_URL + '/epub/' + this.fileName + '.epub' */
      this.book = new Epub(url)
      this.setCurrentBook(this.book)
      this.setIsPaginating(true)
      this.setPaginate(this.$t('book.paginating'))
      this.initRendition()
      // this.initGesture()
      this.parseBook()
    }
  },
  mounted() {
    const books = this.$route.params.fileName.split('|')
    const fileName = books[1]
    getLocalForage(fileName, (err, blob) => {
      // cachedBook loaded
      if (!err && blob) {
        this.setFileName(books.join('/')).then(() => {
          this.showEpub(blob)
        })
      } else {
        this.setFileName(books.join('/')).then(() => {
          const url =
            process.env.VUE_APP_EPUB_URL + '/' + this.fileName + '.epub'
          this.showEpub(url)
        })
      }
    })
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import '../../assets/styles/global';
.ebook-reader {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .ebook-reader-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
    background: transparent;
  }
}
</style>
