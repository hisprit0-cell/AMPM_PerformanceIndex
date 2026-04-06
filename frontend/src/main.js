import { createApp } from 'vue'
import { Quasar, Notify, Dark } from 'quasar'
import VueApexCharts from 'vue3-apexcharts'
import router from './router'

// 🎨 아이콘 및 Quasar 스타일 임포트 (Import icons and styles)
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

import './style.css'
import App from './App.vue'

const app = createApp(App)

/**
 * 📦 Quasar 인스턴스 초기화 (Initialize Quasar)
 */
app.use(Quasar, {
  plugins: { Notify, Dark },
  config: {
    dark: true // 기본값 다크모드 (Default: Dark mode)
  }
})

/**
 * 🗺️ 라우터 및 차트 라이브러리 연동 (Router and Charts)
 */
app.use(router)
app.use(VueApexCharts)

app.mount('#app')
