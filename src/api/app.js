import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/apps',
    method: 'get',
    params: query
  })
}

export function deleteApp(id) {
  return request({
    url: `/apps/${id}`,
    method: 'delete'
  })
}

export function switchStatus(data) {
  return request({
    url: `/apps/${data.id}/switch`,
    method: 'put',
    data
  })
}

export function resetAppSecurity(data) {
  return request({
    url: `/apps/${data.id}/reset`,
    method: 'put',
    data
  })
}

export function createApp(data) {
  return request({
    url: `/apps`,
    method: 'post',
    data
  })
}

export function updateApp(data) {
  return request({
    url: `/apps/${data.id}`,
    method: 'put',
    data
  })
}

