window.dt = false
document.documentElement.classList.add('web')
const ua = navigator.userAgent
let os
if (/Windows/.test(ua)) {
  os = 'windows'
} else if (/Macintosh/.test(ua)) {
  os = 'mac'
} else {
  os = 'linux'
}
document.documentElement.classList.add(os)
window.os = os
