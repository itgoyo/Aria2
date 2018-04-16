import Store from './store'

class Core {
  constructor () {
    this.cookies = {}
  }
  httpSend ({url, options}, resolve, reject) {
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
  getConfigData (key = null) {
    return Store.getConfigData(key)
  }
  objectToQueryString (obj) {
    return Object.keys(obj).map((key) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`
    }).join('&')
  }
  sendToBackground (method, data, callback) {
    chrome.runtime.sendMessage({
      method,
      data
    }, callback)
  }
  showToast (message, type) {
    window.postMessage({ type: 'showToast', data: { message, type } }, location.origin)
  }
  getHashParameter (name) {
    const hash = window.location.hash
    const paramsString = hash.substr(1)
    const searchParams = new URLSearchParams(paramsString)
    return searchParams.get(name)
  }
  formatCookies () {
    const cookies = []
    for (let key in this.cookies) {
      cookies.push(`${key}=${this.cookies[key]}`)
    }
    return cookies.join('; ')
  }
  getHeader (type = 'RPC') {
    const headerOption = []
    headerOption.push(`User-Agent: ${this.getConfigData('userAgent')}`)
    headerOption.push(`Referer: ${this.getConfigData('referer')}`)
    if (Object.keys(this.cookies).length > 0) {
      headerOption.push(`Cookie: ${this.formatCookies()}`)
    }
    const headers = this.getConfigData('headers')
    if (headers) {
      headers.split('\n').forEach((item) => {
        headerOption.push(item)
      })
    }
    if (type === 'RPC') {
      return headerOption
    } else if (type === 'aria2Cmd') {
      return headerOption.map(item => `--header ${JSON.stringify(item)}`).join(' ')
    } else if (type === 'aria2c') {
      return headerOption.map(item => ` header=${item}`).join('\n')
    } else if (type === 'idm') {
      return headerOption.map((item) => {
        const headers = item.split(': ')
        return `${headers[0].toLowerCase()}: ${headers[1]}`
      }).join('\r\n')
    }
  }
  // 解析 RPC地址 返回验证数据 和地址
  parseURL (url) {
    const parseURL = new URL(url)
    let authStr = parseURL.username ? `${parseURL.username}:${decodeURI(parseURL.password)}` : null
    if (authStr) {
      if (!authStr.includes('token:')) {
        authStr = `Basic ${btoa(authStr)}`
      }
    }
    const paramsString = parseURL.hash.substr(1)
    let options = {}
    const searchParams = new URLSearchParams(paramsString)
    for (let key of searchParams) {
      options[key[0]] = key.length === 2 ? key[1] : 'enabled'
    }
    const path = parseURL.origin + parseURL.pathname
    return {authStr, path, options}
  }
  generateParameter (authStr, path, data) {
    if (authStr && authStr.startsWith('token')) {
      data.params.unshift(authStr)
    }
    const parameter = {
      url: path,
      options: {
        method: 'POST',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: JSON.stringify(data)
      }
    }
    if (authStr && authStr.startsWith('Basic')) {
      parameter.options.headers['Authorization'] = authStr
    }
    return parameter
  }
  // get aria2 version
  getVersion (rpcPath, element) {
    let data = {
      jsonrpc: '2.0',
      method: 'aria2.getVersion',
      id: 1,
      params: []
    }
    const {authStr, path} = this.parseURL(rpcPath)
    this.sendToBackground('rpcVersion', this.generateParameter(authStr, path, data), (version) => {
      if (version) {
        element.innerText = `Aria2版本为: ${version}`
      } else {
        element.innerText = '错误,请查看是否开启Aria2'
      }
    })
  }
  copyText (text) {
    const input = document.createElement('textarea')
    document.body.appendChild(input)
    input.value = text
    input.focus()
    input.select()
    const result = document.execCommand('copy')
    input.remove()
    if (result) {
      this.showToast('拷贝成功~', 'success')
    } else {
      this.showToast('拷贝失败 QAQ', 'failure')
    }
  }
  // cookies format  [{"url": "http://pan.baidu.com/", "name": "BDUSS"},{"url": "http://pcs.baidu.com/", "name": "pcsett"}]
  requestCookies (cookies) {
    this.sendToBackground('getCookies', cookies, (value) => { this.cookies = value })
  }
  aria2RPCMode (rpcPath, fileDownloadInfo) {
    const {authStr, path, options} = this.parseURL(rpcPath)
    fileDownloadInfo.forEach((file) => {
      const rpcData = {
        jsonrpc: '2.0',
        method: 'aria2.addUri',
        id: new Date().getTime(),
        params: [
          [file.link], {
            out: file.name,
            header: this.getHeader()
          }
        ]
      }
      const md5Check = this.getConfigData('md5Check')
      const rpcOption = rpcData.params[1]
      const dir = this.getConfigData('downloadPath')
      if (dir) {
        rpcOption['dir'] = dir
      }
      if (md5Check) {
        rpcOption['checksum'] = `md5=${file.md5}`
      }
      if (options) {
        for (let key in options) {
          rpcOption[key] = options[key]
        }
      }
      this.sendToBackground('rpcData', this.generateParameter(authStr, path, rpcData), (success) => {
        if (success) {
          this.showToast('下载成功!赶紧去看看吧~', 'success')
        } else {
          this.showToast('下载失败!是不是没有开启Aria2?', 'failure')
        }
      })
    })
  }
  aria2TXTMode (fileDownloadInfo) {
    const aria2CmdTxt = []
    const aria2Txt = []
    const idmTxt = []
    const downloadLinkTxt = []
    const prefixTxt = 'data:text/plain;charset=utf-8,'
    fileDownloadInfo.forEach((file) => {
      let aria2CmdLine = `aria2c -c -s10 -k1M -x16 --enable-rpc=false -o ${JSON.stringify(file.name)} ${this.getHeader('aria2Cmd')} ${JSON.stringify(file.link)}`
      let aria2Line = [file.link, this.getHeader('aria2c'), ` out=${file.name}`].join('\n')
      const md5Check = this.getConfigData('md5Check')
      if (md5Check) {
        aria2CmdLine += ` --checksum=md5=${file.md5}`
        aria2Line += ` checksum=md5=${file.md5}`
      }
      aria2CmdTxt.push(aria2CmdLine)
      aria2Txt.push(aria2Line)
      const idmLine = ['<', file.link, this.getHeader('idm'), '>'].join('\r\n')
      idmTxt.push(idmLine)
      downloadLinkTxt.push(file.link)
    })
    document.querySelector('#aria2CmdTxt').value = `${aria2CmdTxt.join('\n')}`
    document.querySelector('#aria2Txt').href = `${prefixTxt}${encodeURIComponent(aria2Txt.join('\n'))}`
    document.querySelector('#idmTxt').href = `${prefixTxt}${encodeURIComponent(idmTxt.join('\r\n') + '\r\n')}`
    document.querySelector('#downloadLinkTxt').href = `${prefixTxt}${encodeURIComponent(downloadLinkTxt.join('\n'))}`
    document.querySelector('#copyDownloadLinkTxt').dataset.link = downloadLinkTxt.join('\n')
  }
}

export default new Core()
