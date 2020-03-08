import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 导入全局样式表
import './assets/css/global.css'

import axios from 'axios'
// 设置请求的根路径
axios.default.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 把这个包挂载到vue的原型对象上
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
