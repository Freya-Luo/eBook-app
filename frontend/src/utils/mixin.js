/* eslint-disable */
import { mapGetters, mapActions } from 'vuex'
import { themeList, addCss, removeAllCss, getReadTimeInMinute } from './book'
import { saveLocation, getBookmark, getBookShelf, saveBookShelf } from './localStorage'
import { gotoBookDetail, appendAddToShelf, removeAddFromShelf, computeId } from './store'
import { shelf } from '../api/store'

export const ebookMixin = {
    computed: {
        // a computed getter
        ...mapGetters([
            'fileName',
            'menuVisible',
            'settingVisible',
            'defaultFontSize',
            'defaultFontFamily',
            'fontFamilyVisible',
            'defaultTheme',
            'bookAvailable',
            'progress',
            'section',
            'isPaginating',
            'currentBook',
            'navigation',
            'cover',
            'metadata',
            'paginate',
            'pagelist',
            'offsetY',
            'isBookmark',
            'speakingIconBottom'
        ]),
        themeList () {
            return themeList(this)
        },
        getSectionName () {
            // if (this.section) {
            //   const secObj = this.currentBook.section(this.section)
            //   if (secObj && secObj.href && this.currentBook && this.currentBook.navigation) {
            // this get() method can only get 1st-level content label, no its subitems can be obtained
            //     return this.currentBook.navigation.get(secObj.href).label
            //   }
            // }
            return this.section ? this.navigation[this.section].label : ''
        }
    },
    methods: {
        ...mapActions([
            'setMenuVisible',
            'setFileName',
            'setSettingVisible',
            'setDefaultFontSize',
            'setDefaultFontFamily',
            'setFontFamilyVisible',
            'setDefaultTheme',
            'setBookAvailable',
            'setProgress',
            'setSection',
            'setIsPaginating',
            'setCurrentBook',
            'setNavigation',
            'setCover',
            'setMetadata',
            'setPaginate',
            'setPagelist',
            'setOffsetY',
            'setIsBookmark',
            'setSpeakingIconBottom'
        ]),
        initGlobalStyle () {
            removeAllCss()
            // Only need to add external .css link can accomplish dynamic style change (all except iframe)
            switch (this.defaultTheme) {
                case 'Default':
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
                    break
                case 'Eye':
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_eye.css`)
                    break
                case 'Gold':
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_gold.css`)
                    break
                case 'Night':
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_night.css`)
                    break
                default:
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_eye.css`)
                    break
            }
        },
        refreshLocation () {
            const currentLocation = this.currentBook.rendition.currentLocation()
            if (currentLocation && currentLocation.start) {
                const startCfi = currentLocation.start.cfi
                const progress = this.currentBook.locations.percentageFromCfi(startCfi)
                this.setSection(currentLocation.start.index)
                this.setProgress(Math.floor(progress * 100))
                saveLocation(this.fileName, startCfi)
                const bookmarks = getBookmark(this.fileName)
                if (bookmarks && bookmarks.some(item => item.cfi === startCfi)) {
                    this.setIsBookmark(true)
                } else {
                    this.setIsBookmark(false)
                }
                if (this.pagelist) {
                    const totalPage = this.pagelist.length
                    const currentPage = currentLocation.start.location
                    if (currentPage && currentPage > 0) {
                        this.setPaginate(currentPage + '/' + totalPage)
                    } else {
                        this.setPaginate('')
                    }
                } else {
                    this.setPaginate('')
                }
            }
        },
        display (target, cb) {
            if (target) {
                // this.rendition.display(target)
                this.currentBook.rendition.display(target).then(() => {
                    // High-level repetitive calling function with call-back function
                    this.refreshLocation()
                    if (cb) cb()
                })
            } else {
                this.rendition.display().then(() => {
                    this.refreshLocation()
                    if (cb) cb()
                })
            }
        },
        hideTitleAndMenu () {
            this.setMenuVisible(false)
            this.setSettingVisible(-1)
            this.setFontFamilyVisible(false)
        },
        getReadTimeCnt () {
            return this.$t('book.haveRead').replace('$1', getReadTimeInMinute(this.fileName))
        }
    }
}

export const storeHomeMixin = {
    computed: {
        ...mapGetters([
            'offsetY',
            'hotSearchOffsetY',
            'flapCardVisible'
        ])
    },
    methods: {
        ...mapActions([
            'setOffsetY',
            'setHotSearchOffsetY',
            'setFlapCardVisible'
        ]),
        showBookDetail (book) {
            gotoBookDetail(this, book)
        }
    }
}

export const storeShelfMixin = {
    computed: {
        ...mapGetters([
            'isEditMode',
            'shelfList',
            'shelfSelected',
            'shelfTitleVisible',
            'offsetY',
            'shelfCategory',
            'currentType'
        ])
    },
    methods: {
        ...mapActions([
            'setIsEditMode',
            'setShelfList',
            'setShelfSelected',
            'setShelfTitleVisible',
            'setOffsetY',
            'setShelfCategory',
            'setCurrentType'
        ]),
        showBookDetail (book) {
            gotoBookDetail(this, book)
        },
        getShelfList () {
            let shelfList = getBookShelf()
            if (!shelfList) {
                shelf().then((response) => {
                    if (
                        response.status === 200 &&
                        response.data &&
                        response.data.bookList
                    ) {
                        shelfList = appendAddToShelf(response.data.bookList)
                        saveBookShelf(shelfList)
                        return this.setShelfList(shelfList) // Get a promise
                    }
                })
            } else {
                return this.setShelfList(shelfList)
            }
        },
        getCategoryList (title) {
            this.getShelfList().then(() => {
                const categoryList = this.shelfList.filter(book => book.type === 2 && book.title === title)[0]
                this.setShelfCategory(categoryList)
            })
        },
        moveOutOfGroup (cb) {
            this.setShelfList(
                this.shelfList.map((book) => {
                    if (book.type === 2 && book.itemList) {
                        book.itemList = book.itemList.filter((sub) => !sub.selected)
                    }
                    return book
                })
            ).then(() => {
                let list = removeAddFromShelf(this.shelfList)
                list = appendAddToShelf([].concat(list, ...this.shelfSelected))
                computeId(list)
                this.setShelfList(list).then(() => {
                    this.simpleToast(this.$t('shelf.moveBookOutSuccess'))
                    if (cb) cb()
                })
            })
        }
    }
}


/**
 * @method display(target,callback) display frame handles split-pages algorithm => a proper location, minor difference
 */