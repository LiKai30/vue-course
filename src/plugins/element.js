import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 和前面的不同，Message的使用需要挂载到vue的原型上
Vue.prototype.$message = Message
