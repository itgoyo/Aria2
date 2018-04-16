if (typeof browser !== 'undefined') {
  chrome = browser
}

function requestAddScript (name) {
  chrome.runtime.sendMessage({
    method: 'addScript',
    data: `js/${name}.js`
  })
}
window.addEventListener('message', function (event) {
  if (event.data.type === 'yunData') {
    window.yunData = event.data.data
    if (window.location.href.includes('/disk/home')) {
      requestAddScript('home')
    } else {
      requestAddScript('share')
    }
  }
})

function addBaiduJS () {
  let script = document.createElement('script')
  script.src = chrome.runtime.getURL('js/baidu.js')
  document.body.appendChild(script)
}

if (document.readyState === 'complete') {
  // run on firefox
  addBaiduJS()
} else {
  // run on chrome
  window.addEventListener('load', addBaiduJS)
}
