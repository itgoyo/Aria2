if (typeof browser !== 'undefined') {
  chrome = browser
}

const httpSend = ({url, options}, resolve, reject) => {
  fetch(url, options).then((response) => {
    if (response.ok) {
      response.json().then((data) => {
        resolve(data)
      })
    } else {
      reject(response)
    }
  }).catch((err) => {
    reject(err)
  })
}
// https://developer.chrome.com/apps/runtime#event-onMessage
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.method) {
    case 'addScript':
      chrome.tabs.executeScript(sender.tab.id, { file: request.data })
      break
    case 'rpcData':
      httpSend(request.data, (data) => {
        sendResponse(true)
      }, (err) => {
        console.log(err)
        sendResponse(false)
      })
      return true
    case 'configData':
      for (let key in request.data) {
        localStorage.setItem(key, request.data[key])
      }
      break
    case 'rpcVersion':
      httpSend(request.data, (data) => {
        sendResponse(data.result.version)
      }, (err) => {
        console.log(err)
        sendResponse(false)
      })
      return true
    case 'getCookies':
      getCookies(request.data).then(value => sendResponse(value))
      return true
  }
})

// Promise style `chrome.cookies.get()`
const getCookie = (detail) => {
  return new Promise(function (resolve) {
    chrome.cookies.get(detail, resolve)
  })
}

const getCookies = (details) => {
  return new Promise(function (resolve) {
    const list = details.map(item => getCookie(item))
    Promise.all(list).then(function (cookies) {
      let obj = {}
      for (let item of cookies) {
        if (item !== null) {
          obj[item.name] = item.value
        }
      }
      resolve(obj)
    })
  })
}

const showNotification = (id, opt) => {
  if (!chrome.notifications) {
    return
  }
  chrome.notifications.create(id, opt, () => {})
  setTimeout(() => {
    chrome.notifications.clear(id, () => {})
  }, 5000)
}
// 软件版本更新提示
const manifest = chrome.runtime.getManifest()
const previousVersion = localStorage.getItem('version')
if (previousVersion === '' || previousVersion !== manifest.version) {
  var opt = {
    type: 'basic',
    title: '更新',
    message: '百度网盘助手更新到' + manifest.version + '版本啦～\n此次更新恢复自定义文件夹层数功能~',
    iconUrl: 'img/icon.jpg'
  }
  const id = new Date().getTime().toString()
  showNotification(id, opt)
  localStorage.setItem('version', manifest.version)
}
