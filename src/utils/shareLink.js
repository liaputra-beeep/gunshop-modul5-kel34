export const buildShareUrl = (id) =>
  `${window.location.origin}/?gun=${encodeURIComponent(id)}`

export const getSharedId = () =>
  new URLSearchParams(window.location.search).get('gun')

export const setUrlGun = (id) =>
  window.history.pushState({}, '', id ? `/?gun=${encodeURIComponent(id)}` : '/')