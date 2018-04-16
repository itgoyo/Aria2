import Core from './core'
import Store from './store'

class UI {
  constructor () {
    this.version = '1.0.2'
    this.updateDate = '2017/12/30'
    Store.on('updateView', (configData) => {
      this.updateSetting(configData)
      this.updateMenu(configData)
    })
  }
  init () {
    this.addSettingUI()
    this.addTextExport()
    Store.trigger('initConfigData')
  }
  // z-index resolve share page show problem
  addMenu (element, position) {
    const menu = `
      <div id="exportMenu" class="g-dropdown-button">
        <a class="g-button">
          <span class="g-button-right">
            <em class="icon icon-download"></em>
            <span class="text">导出下载</span>
          </span>
        </a>
        <div id="aria2List" class="menu" style="z-index:50;">
          <a class="g-button-menu" id="aria2Text" href="javascript:void(0);">文本导出</a>
          <a class="g-button-menu" id="settingButton" href="javascript:void(0);">设置</a>
        </div>
      </div>`
    element.insertAdjacentHTML(position, menu)
    const exportMenu = document.querySelector('#exportMenu')
    exportMenu.addEventListener('mouseenter', () => {
      exportMenu.classList.add('button-open')
    })
    exportMenu.addEventListener('mouseleave', () => {
      exportMenu.classList.remove('button-open')
    })
    const settingButton = document.querySelector('#settingButton')
    const settingMenu = document.querySelector('#settingMenu')
    settingButton.addEventListener('click', () => {
      settingMenu.classList.add('open-o')
    })
  }
  resetMenu () {
    Array.from(document.querySelectorAll('.rpc-button')).forEach((rpc) => {
      rpc.remove()
    })
  }
  updateMenu (configData) {
    this.resetMenu()
    const { rpcList } = configData
    let rpcDOMList = ''
    rpcList.forEach((rpc) => {
      const rpcDOM = `<a class="g-button-menu rpc-button" href="javascript:void(0);" data-url=${rpc.url}>${rpc.name}</a>`
      rpcDOMList += rpcDOM
    })
    document.querySelector('#aria2List').insertAdjacentHTML('afterbegin', rpcDOMList)
  }
  addTextExport () {
    const text = `
      <div id="textMenu" class="modal export-menu">
        <div class="modal-inner">
          <div class="modal-header">
            <div class="modal-title">文本导出</div>
            <div class="modal-close">×</div>
          </div>
          <div class="modal-body">
            <div class="export-menu-row">
              <a class="export-menu-button" href="javascript:void(0);" id="aria2Txt" download="aria2c.down">存为Aria2文件</a>
              <a class="export-menu-button" href="javascript:void(0);" id="idmTxt" download="idm.ef2">存为IDM文件</a>
              <a class="export-menu-button" href="javascript:void(0);" id="downloadLinkTxt" download="link.txt">保存下载链接</a>
              <a class="export-menu-button" href="javascript:void(0);" id="copyDownloadLinkTxt">拷贝下载链接</a>
            </div>
            <div class="export-menu-row">
              <textarea class="export-menu-textarea" type="textarea" wrap="off" spellcheck="false" id="aria2CmdTxt"></textarea>
            </div>
          </div>
        </div>
      </div>`
    document.body.insertAdjacentHTML('beforeend', text)
    const textMenu = document.querySelector('#textMenu')
    const close = textMenu.querySelector('.modal-close')
    const copyDownloadLinkTxt = textMenu.querySelector('#copyDownloadLinkTxt')
    copyDownloadLinkTxt.addEventListener('click', () => {
      Core.copyText(copyDownloadLinkTxt.dataset.link)
    })
    close.addEventListener('click', () => {
      textMenu.classList.remove('open-o')
      this.resetTextExport()
    })
  }
  resetTextExport () {
    const textMenu = document.querySelector('#textMenu')
    textMenu.querySelector('#aria2Txt').href = ''
    textMenu.querySelector('#idmTxt').href = ''
    textMenu.querySelector('#downloadLinkTxt').href = ''
    textMenu.querySelector('#aria2CmdTxt').value = ''
    textMenu.querySelector('#copyDownloadLinkTxt').dataset.link = ''
  }
  addSettingUI () {
    const setting = `
      <div id="settingMenu" class="modal setting-menu">
        <div class="modal-inner">
          <div class="modal-header">
            <div class="modal-title">导出设置</div>
            <div class="modal-close">×</div>
          </div>
          <div class="modal-body">
            <div class="setting-menu-message">
              <label class="setting-menu-label orange-o" id="message"></label>
            </div>
            <div class="setting-menu-row rpc-s">
              <div class="setting-menu-name">
                <input class="setting-menu-input name-s" spellcheck="false">
              </div>
              <div class="setting-menu-value">
                <input class="setting-menu-input url-s" spellcheck="false">
                <a class="setting-menu-button" id="addRPC" href="javascript:void(0);">添加RPC地址</a>
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">配置同步</label>
              </div>
              <div class="setting-menu-value">
                <input type="checkbox" class="setting-menu-checkbox configSync-s">
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">MD5校验</label>
              </div>
              <div class="setting-menu-value">
                <input type="checkbox" class="setting-menu-checkbox md5Check-s">
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
               <div class="setting-menu-name">
                 <label class="setting-menu-label">文件夹层数</label>
               </div>
               <div class="setting-menu-value">
                 <input class="setting-menu-input small-o fold-s" type="number" spellcheck="false">
                 <label class="setting-menu-label">(默认0表示不保留,-1表示保留完整路径)</label>
               </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">递归下载间隔</label>
              </div>
              <div class="setting-menu-value">
                <input class="setting-menu-input small-o interval-s" type="number" spellcheck="false">
                <label class="setting-menu-label">(单位:毫秒)</label>
                <a class="setting-menu-button version-s" id="testAria2" href="javascript:void(0);">测试连接，成功显示版本号</a>
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">下载路径</label>
              </div>
              <div class="setting-menu-value">
                <input class="setting-menu-input downloadPath-s" placeholder="只能设置为绝对路径" spellcheck="false">
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">User-Agent</label>
              </div>
              <div class="setting-menu-value">
                <input class="setting-menu-input userAgent-s" spellcheck="false">
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">Referer</label>
              </div>
              <div class="setting-menu-value">
                <input class="setting-menu-input referer-s" spellcheck="false">
              </div>
            </div><!-- /.setting-menu-row -->
            <div class="setting-menu-row">
              <div class="setting-menu-name">
                <label class="setting-menu-label">Headers</label>
              </div>
              <div class="setting-menu-value">
                <textarea class="setting-menu-input textarea-o headers-s" type="textarea" spellcheck="false"></textarea>
              </div>
            </div><!-- /.setting-menu-row -->
          </div><!-- /.setting-menu-body -->
          <div class="modal-footer">
            <div class="setting-menu-copyright">
              <div class="setting-menu-item">
                <label class="setting-menu-label">&copy; Copyright</label>
                <a class="setting-menu-link" href="https://github.com/acgotaku/BaiduExporter" target="_blank">雪月秋水</a>
              </div>
              <div class="setting-menu-item">
                <label class="setting-menu-label">Version: ${this.version}</label>
                <label class="setting-menu-label">Update date: ${this.updateDate}</label>
              </div>
            </div><!-- /.setting-menu-copyright -->
            <div class="setting-menu-operate">
              <a class="setting-menu-button large-o blue-o" id="apply" href="javascript:void(0);">应用</a>
              <a class="setting-menu-button large-o" id="reset" href="javascript:void(0);">重置</a>
            </div>
          </div>
        </div>
      </div>`
    document.body.insertAdjacentHTML('beforeend', setting)
    const settingMenu = document.querySelector('#settingMenu')
    const close = settingMenu.querySelector('.modal-close')
    close.addEventListener('click', () => {
      settingMenu.classList.remove('open-o')
      this.resetSetting()
    })
    const addRPC = document.querySelector('#addRPC')
    addRPC.addEventListener('click', () => {
      const rpcDOMList = document.querySelectorAll('.rpc-s')
      const RPC = `
        <div class="setting-menu-row rpc-s">
          <div class="setting-menu-name">
            <input class="setting-menu-input name-s" spellcheck="false">
          </div>
          <div class="setting-menu-value">
            <input class="setting-menu-input url-s" spellcheck="false">
          </div>
        </div><!-- /.setting-menu-row -->`
      Array.from(rpcDOMList).pop().insertAdjacentHTML('afterend', RPC)
    })
    const apply = document.querySelector('#apply')
    const message = document.querySelector('#message')
    apply.addEventListener('click', () => {
      this.saveSetting()
      message.innerText = '设置已保存'
    })

    const reset = document.querySelector('#reset')
    reset.addEventListener('click', () => {
      Store.trigger('clearConfigData')
      message.innerText = '设置已重置'
    })

    const testAria2 = document.querySelector('#testAria2')
    testAria2.addEventListener('click', () => {
      Core.getVersion(Store.getConfigData('rpcList')[0].url, testAria2)
    })
  }
  resetSetting () {
    const message = document.querySelector('#message')
    message.innerText = ''
    const testAria2 = document.querySelector('#testAria2')
    testAria2.innerText = '测试连接，成功显示版本号'
  }
  updateSetting (configData) {
    const { rpcList, configSync, md5Check, fold, interval, downloadPath, userAgent, referer, headers } = configData
    // reset dom
    Array.from(document.querySelectorAll('.rpc-s')).forEach((rpc, index) => {
      if (index !== 0) {
        rpc.remove()
      }
    })
    rpcList.forEach((rpc, index) => {
      const rpcDOMList = document.querySelectorAll('.rpc-s')
      if (index === 0) {
        rpcDOMList[index].querySelector('.name-s').value = rpc.name
        rpcDOMList[index].querySelector('.url-s').value = rpc.url
      } else {
        const RPC = `
          <div class="setting-menu-row rpc-s">
            <div class="setting-menu-name">
              <input class="setting-menu-input name-s" value="${rpc.name}" spellcheck="false">
            </div>
            <div class="setting-menu-value">
              <input class="setting-menu-input url-s" value="${rpc.url}" spellcheck="false">
            </div>
          </div><!-- /.setting-menu-row -->`
        Array.from(rpcDOMList).pop().insertAdjacentHTML('afterend', RPC)
      }
    })
    document.querySelector('.configSync-s').checked = configSync
    document.querySelector('.md5Check-s').checked = md5Check
    document.querySelector('.fold-s').value = fold
    document.querySelector('.interval-s').value = interval
    document.querySelector('.downloadPath-s').value = downloadPath
    document.querySelector('.userAgent-s').value = userAgent
    document.querySelector('.referer-s').value = referer
    document.querySelector('.headers-s').value = headers
  }

  saveSetting () {
    const rpcDOMList = document.querySelectorAll('.rpc-s')
    const rpcList = Array.from(rpcDOMList).map((rpc) => {
      const name = rpc.querySelector('.name-s').value
      const url = rpc.querySelector('.url-s').value
      if (name && url) {
        return { name, url }
      }
    }).filter(el => el)
    const configSync = document.querySelector('.configSync-s').checked
    const md5Check = document.querySelector('.md5Check-s').checked
    const fold = Number.parseInt(document.querySelector('.fold-s').value)
    const interval = document.querySelector('.interval-s').value
    const downloadPath = document.querySelector('.downloadPath-s').value
    const userAgent = document.querySelector('.userAgent-s').value
    const referer = document.querySelector('.referer-s').value
    const headers = document.querySelector('.headers-s').value

    const configData = {
      rpcList,
      configSync,
      md5Check,
      fold,
      interval,
      downloadPath,
      userAgent,
      referer,
      headers
    }
    Store.trigger('setConfigData', configData)
  }
}

export default new UI()
