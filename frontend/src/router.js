import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/store'
    },
    {
      path: '/ebook',
      component: resolve => require(['./views/ebook/index.vue'], resolve),
      children: [
        {
          path: ':fileName',
          component: resolve => require(['./components/ebook/EbookReader.vue'], resolve)
        }
      ]
    },
    {
      path: '/store',
      component: resolve => require(['./views/store/index.vue'], resolve),
      redirect: '/store/shelf',
      children: [
        {
          path: 'home',
          component: resolve => require(['./views/store/StoreHome.vue'], resolve)
        }, {
          path: 'list',
          component: resolve => require(['./views/store/StoreList.vue'], resolve)
        }, {
          path: 'detail',
          component: resolve => require(['./views/store/StoreDetail.vue'], resolve)
        }, {
          path: 'shelf',
          component: resolve => require(['./views/store/StoreShelf.vue'], resolve)
        }, {
          path: 'category',
          component: resolve => require(['./views/store/StoreCategory.vue'], resolve)
        }, {
          path: 'speaking',
          component: resolve => require(['./views/store/StoreSpeaking.vue'], resolve)
        }
      ]
    }
  ]
})
