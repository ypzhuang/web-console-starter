import request from '@/utils/request'

export function fetchAllDicts() {
  return request({
    url: '/dicts',
    method: 'get'
  })
}
