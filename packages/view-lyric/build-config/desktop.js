const os = /os=(\w+)/.exec(window.location.search)?.[1]
window.os = os
if (/&t=(.+)(#|$)/.test(window.location.search)) window.setTheme(JSON.parse(decodeURIComponent(RegExp.$1)))
