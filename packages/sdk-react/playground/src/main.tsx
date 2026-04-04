import React from 'react'
import ReactDOM from 'react-dom/client'
import { ReviewsKitProvider } from '@reviewskits/react'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReviewsKitProvider config={{
      pk: 'rk_pk_live_c11d1990270d2aebdab91a7fe9acb744e0821499fba4c6d3',
      host: 'http://localhost:3000',
      cache: true
    }}>
      <App />
    </ReviewsKitProvider>
  </React.StrictMode>,
)
