import React from 'react'
import ReactDOM from 'react-dom/client'
import { ReviewsKitProvider } from '@reviewskits/react'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReviewsKitProvider config={{
      pk: 'rk_pk_live_4f70bb4ac05c2188f9ae1977466812bb4f9cf44421f2ef91',
      host: 'http://localhost:3000'
    }}>
      <App />
    </ReviewsKitProvider>
  </React.StrictMode>,
)
