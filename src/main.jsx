import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'  // <- caminho relativo ao main.jsx
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
