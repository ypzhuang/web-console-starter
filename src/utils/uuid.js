
export function uuidMask(uuid) {
  if (uuid.length !== 32 || uuid.indexOf('*') > 0) return uuid
  const header = uuid.substring(0, 4)
  const tailer = uuid.substring(uuid.length - 4, uuid.length)
  const stars = '*'.repeat(uuid.length - 8)
  return header + stars + tailer
}
