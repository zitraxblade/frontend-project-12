import Rollbar from 'rollbar'

const rollbar = new Rollbar({
  accessToken: import.meta.env.VITE_ROLLBAR_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: 'development',
})

export default rollbar
