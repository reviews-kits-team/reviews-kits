import { createApp } from 'vue'
import { createReviewsKit } from '@reviewskits/vue'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// Initialize ReviewsKit SDK
app.use(createReviewsKit({
  pk: 'rk_pk_live_c11d1990270d2aebdab91a7fe9acb744e0821499fba4c6d3',
  host: 'http://localhost:3000',
  cache: true
}))

app.mount('#app')
