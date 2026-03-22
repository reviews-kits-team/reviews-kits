import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createReviewsKit } from '@reviewskits/vue'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// Initialize Vue Query
app.use(VueQueryPlugin)

// Initialize ReviewsKit SDK
app.use(createReviewsKit({
  pk: 'rk_pk_live_19727b7243871582c69867cc39e3826953b1b11671e58bcd',
  host: 'http://localhost:3000'
}))

app.mount('#app')
