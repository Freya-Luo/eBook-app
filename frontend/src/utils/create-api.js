import CreateAPI from 'vue-create-api'
import Vue from 'vue'
import Toast from '../components/common/Toast'
import Popup from '../components/common/Popup'
import GroupDialog from '../components/shelf/ShelfGroupDialog'

Vue.use(CreateAPI)
Vue.createAPI(Toast, true)
Vue.createAPI(Popup, true)
Vue.createAPI(GroupDialog, true)
Vue.mixin({
    methods: {
        toast (settings) {
            return this.$createToast({
                $props: settings
            })
        },
        popup (settings) {
            return this.$createPopup({
                $props: settings
            })
        },
        simpleToast (text) {
            const toast = this.toast({
                text: text
            })
            toast.show()
            // create-api cannot update the value of passed params
            toast.updateText(text)
        },
        dialog (settings) {
            return this.$createGroupDialog({
                $props: settings
            })
        }
    }
})

/* Full-screen DOM added, below the "app" DOM (directly in the <body></body>) instead of inside the "app" DOM,
we can use create-api to simplify the dynamic component rendering. */
