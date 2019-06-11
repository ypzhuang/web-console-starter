import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import i18n from '../lang'
// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const { data } = response
    if (response.status !== 200) {
      Message({
        message: response.error || 'error',
        type: 'error',
        duration: 5 * 1000
      })

      return Promise.reject(response.error || 'error')
    } else {
      return data
    }
  },
  error => {
    console.dir(error)
    // 404: API error; 403: Forbidden; 401: Unauthorized;
    if (error.response.status === 404 || error.response.status === 403 || error.response.status === 401) {
      // to re-login
      const message = i18n.messages[i18n.locale].login.reloginWarnning
      const warning = i18n.messages[i18n.locale].login.confirmLogout
      MessageBox.confirm(message, warning, {
        confirmButtonText: (i18n.messages[i18n.locale])['login.reLogin'],
        cancelButtonText: (i18n.messages[i18n.locale])['cancel'],
        type: 'warning'
      }).then(() => {
        store.dispatch('user/resetToken').then(() => {
          location.reload()
        })
      })
    } else {
      Message({
        message: error.response.data.error,
        type: 'error',
        duration: 5 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export default service
