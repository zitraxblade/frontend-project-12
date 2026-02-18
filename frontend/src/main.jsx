import 'react-toastify/dist/ReactToastify.css'
import './i18n.js'
import 'bootstrap/dist/css/bootstrap.min.css'

import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'

import App from './App.jsx'
import './index.css'
import AuthProvider from './auth/AuthProvider.jsx'
import store from './store.js'

import rollbar from './rollbar.js'

window.rollbar = rollbar

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </Provider>,
)