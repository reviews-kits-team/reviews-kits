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
  pk: 'test_public_key',
  host: 'http://localhost:3000' // Change to your local or staging API
}))

app.mount('#app')
