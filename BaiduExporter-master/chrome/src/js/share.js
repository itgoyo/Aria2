import Core from './lib/core'
import UI from './lib/ui'
import Downloader from './lib/downloader'

class Share extends Downloader {
  constructor () {
    const search = {
      dir: '',
      bdstoken: window.yunData.MYBDSTOKEN,
      uk: window.yunData.SHARE_UK,
      shareid: window.yunData.SHARE_ID,
      channel: 'chunlei',
      clienttype: 0,
      web: 1
    }
    const listParameter = {
      search,
      url: `/share/list?`,
      options: {
        credentials: 'include',
        method: 'GET'
      }
    }
    super(listParameter)
    UI.init()
    UI.addMenu(document.querySelector('a[data-button-id="b1"]'), 'beforebegin')
    Core.requestCookies([{ url: 'https://pan.baidu.com/', name: 'BDUSS' }, { url: 'https://pcs.baidu.com/', name: 'pcsett' }])
    // fix export button position
    document.querySelector('.bar').style.position = 'absolute'
    Core.showToast('初始化成功!', 'success')
    this.mode = 'RPC'
    this.rpcURL = 'http://localhost:6800/jsonrpc'
    this.cookies = null
    this.files = {}
    this.requestCookies()
  }

  startDownload () {
    this.start(Core.getConfigData('interval'), (fileDownloadInfo) => {
      console.log(fileDownloadInfo)
      if (this.mode === 'RPC') {
        Core.aria2RPCMode(this.rpcURL, fileDownloadInfo)
      }
      if (this.mode === 'TXT') {
        Core.aria2TXTMode(fileDownloadInfo)
        document.querySelector('#textMenu').classList.add('open-o')
      }
    })
  }

  requestCookies () {
    Core.sendToBackground('getCookies', [{ url: 'http://pan.baidu.com/', name: 'BDCLND' }], (value) => { this.cookies = decodeURIComponent(value['BDCLND']) })
  }
  startListen () {
    window.addEventListener('message', (event) => {
      if (event.source !== window) {
        return
      }

      if (event.data.type && event.data.type === 'selected') {
        this.reset()
        const selectedFile = event.data.data
        console.log(selectedFile)
        if (selectedFile.length === 0) {
          Core.showToast('请选择一下你要保存的文件哦', 'failure')
          return
        }
        selectedFile.forEach((item) => {
          if (item.isdir) {
            this.addFolder(item.path)
          } else {
            this.addFile(item)
          }
        })
        this.startDownload()
      }
    })
    const menuButton = document.querySelector('#aria2List')
    menuButton.addEventListener('click', (event) => {
      const rpcURL = event.target.dataset.url
      if (rpcURL) {
        this.rpcURL = rpcURL
        this.getSelected()
        this.mode = 'RPC'
      }
      if (event.target.id === 'aria2Text') {
        this.getSelected()
        this.mode = 'TXT'
      }
    })
  }

  getSelected () {
    if (window.yunData.SHAREPAGETYPE === 'single_file_page') {
      this.reset()
      this.addFile({
        fs_id: window.yunData.FS_ID
      })
      this.startDownload()
    } else {
      window.postMessage({ type: 'getSelected' }, location.origin)
    }
  }
  showCaptcha (data, resolve, auth) {
    const captcha = `
      <div id="captchaMenu" class="modal captcha-menu open-o">
        <div class="modal-inner">
          <div class="modal-header">
            <div class="modal-title">提示</div>
            <div class="modal-close">×</div>
          </div>
          <div class="modal-body">
            <div class="captcha-menu-row">
              <label class="captcha-menu-label">请输入验证码：</label>
              <div class="captcha-menu-box">
                <input class="captcha-menu-input" maxlength="4" id="vcodeValue">
                <label class="captcha-menu-label warn-o">${auth === true ? '验证码输入错误' : ''}</label>
              </div>
              <img class="captcha-menu-img" maxlength="4" alt="验证码获取中" width="100" height="30" src=${data.vcode_img} id="vcode">
              <a href="javascript:void(0);" class="captcha-menu-button" id="change">换一张</a>
            </div>
          </div>
          <div class="modal-footer">
          <div class="captcha-menu-operate">
            <a class="captcha-menu-button blue-o" id="apply" href="javascript:void(0);">确定</a>
            <a class="captcha-menu-button" id="reset" href="javascript:void(0);">取消</a>
          </div>
          </div>
        </div>
      </div>`
    document.body.insertAdjacentHTML('beforeend', captcha)
    const captchaMenu = document.querySelector('#captchaMenu')
    const close = captchaMenu.querySelector('.modal-close')
    close.addEventListener('click', () => {
      captchaMenu.remove()
    })
    const apply = captchaMenu.querySelector('#apply')
    apply.addEventListener('click', () => {
      data['vcode_input'] = document.querySelector('#vcodeValue').value
      this.getFiles(this.files, data).then(() => {
        resolve()
      })
      captchaMenu.remove()
    })
    const reset = captchaMenu.querySelector('#reset')
    reset.addEventListener('click', () => {
      captchaMenu.remove()
    })
    const change = captchaMenu.querySelector('#change')
    change.addEventListener('click', () => {
      captchaMenu.querySelector('#vcode').src = `//pan.baidu.com/genimage?${data.vcode_str}&${new Date().getTime()}`
    })
  }
  getCaptcha (resolve, auth) {
    const search = {
      prod: 'share',
      bdstoken: window.yunData.MYBDSTOKEN,
      app_id: 250528,
      channel: 'chunlei',
      clienttype: 0,
      web: 1
    }
    const parameter = {
      search,
      url: `/api/getcaptcha?`,
      options: {
        credentials: 'include',
        method: 'GET'
      }
    }
    fetch(`${window.location.origin}${parameter.url}${Core.objectToQueryString(parameter.search)}`, parameter.options).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          if (data.errno !== 0) {
            Core.showToast('未知错误', 'failure')
            console.log(data)
            return
          }
          this.showCaptcha(data, resolve, auth)
        })
      } else {
        console.log(response)
      }
    }).catch((err) => {
      Core.showToast('网络请求失败', 'failure')
      console.log(err)
    })
  }
  getPrefixLength () {
    const path = Core.getHashParameter('list/path') || Core.getHashParameter('path') || ''
    // solution for example :链接:http://pan.baidu.com/s/1hqOIdUk 密码:qat2
    if (path !== window.yunData.PATH) {
      return window.yunData.PATH.slice(0, window.yunData.PATH.lastIndexOf('/')).length + 1
    } else {
      return path.length === 1 ? 1 : path.length + 1
    }
  }
  getFiles (files, captcha) {
    this.files = files
    let list = []
    for (let key in files) {
      list.push(files[key].fs_id)
    }
    const body = {
      encrypt: '0',
      product: 'share',
      uk: window.yunData.SHARE_UK,
      primaryid: window.yunData.SHARE_ID,
      fid_list: JSON.stringify(list)
    }

    if (!window.yunData.SHARE_PUBLIC) {
      body['extra'] = JSON.stringify({ sekey: this.cookies })
    }
    if (captcha) {
      body['vcode_input'] = captcha['vcode_input']
      body['vcode_str'] = captcha['vcode_str']
    }
    const search = {
      timestamp: window.yunData.TIMESTAMP,
      sign: window.yunData.SIGN,
      bdstoken: window.yunData.MYBDSTOKEN,
      app_id: 250528,
      channel: 'chunlei',
      clienttype: 0,
      web: 1
    }
    const parameter = {
      search,
      url: `/api/sharedownload?`,
      options: {
        body: Core.objectToQueryString(body),
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }
    }
    const prefix = this.getPrefixLength()
    return new Promise((resolve) => {
      fetch(`${window.location.origin}${parameter.url}${Core.objectToQueryString(parameter.search)}`, parameter.options).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            if (data.errno === 0) {
              data.list.forEach((item) => {
                this.fileDownloadInfo.push({
                  name: item.path.substr(prefix),
                  link: item.dlink,
                  md5: item.md5
                })
              })
              resolve()
            } else if (data.errno === -20) {
              Core.showToast('请输入验证码以继续下载', 'caution')
              if (captcha) {
                this.getCaptcha(resolve, true)
              } else {
                this.getCaptcha(resolve, false)
              }
            }
          })
        } else {
          console.log(response)
        }
      }).catch((err) => {
        Core.showToast('网络请求失败', 'failure')
        console.log(err)
      })
    })
  }
}

const share = new Share()

share.startListen()
