import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/messages',
    method: 'get',
    params: query
  })
}

export function resendMessage(data) {
  return request({
    url: `/apps/${data.id}`,
    method: 'post',
    data
  })
}

