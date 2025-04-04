import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { initPixi } from './pixi'
import './style.css'

await initPixi()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
