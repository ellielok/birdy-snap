import { createRouter, createWebHistory } from 'vue-router'
import Homepage from '../views/Homepage.vue'
import Admin from '../views/Admin.vue'
import UploadFile from '../components/UploadFile.vue'
import TextSearch from '../components/TextSearch.vue'
import ImageSearch from '../components/ImageSearch.vue'
import SubscribeTags from '../components/SubscribeTags.vue'
import { exchangeCodeForToken, isAuthenticated, makeCognitoLoginUrl } from '../utils/auth'

const routes = [
  { path: '/', component: Homepage },
  { path: '/reverse-search', component: ImageSearch },
  { path: '/text-search', component: TextSearch },
  { path: '/admin', component: Admin, meta: { requiresAuth: true } },
  { path: '/upload', component: UploadFile, meta: { requiresAuth: true } },
  { path: '/query', redirect: '/text-search' },
  { path: '/subscribe', component: SubscribeTags, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')

  if (code && !isAuthenticated()) {
    try {
      await exchangeCodeForToken(code)
      urlParams.delete('code')
      window.history.replaceState({}, document.title, window.location.pathname)
      next({ path: to.path, query:{} })
      return
    } catch (error) {
      alert('Failed to authenticate. Please try again.')
      next(false)
      return
    }
  }

  if (to.meta.requiresAuth && !isAuthenticated()) {
    window.location.href = makeCognitoLoginUrl()
    return
  }

  next()
})


export default router
