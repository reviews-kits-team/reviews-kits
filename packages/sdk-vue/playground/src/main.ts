import { createApp } from 'vue'
import { createReviewsKit } from '@reviewskits/vue'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// Initialize ReviewsKit SDK
app.use(createReviewsKit({
  pk: 'rk_pk_live_4f70bb4ac05c2188f9ae1977466812bb4f9cf44421f2ef91',
  host: 'http://localhost:3000'
}))

app.mount('#app')
