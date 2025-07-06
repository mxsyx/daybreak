import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'vue-click-to-component/client'

import App from './App.vue'
import { initPixi } from './pixi'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

initPixi().then(() => {
  console.log('pixi initialized')
  app.mount('#app')
})
