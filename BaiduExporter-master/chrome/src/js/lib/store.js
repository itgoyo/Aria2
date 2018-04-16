import EventEmitter from './EventEmitter'

class Store extends EventEmitter {
  constructor () {
    super()
    this.defaultRPC = [{name: 'ARIA2 RPC', url: 'http://localhost:6800/jsonrpc'}]
    this.defaultUserAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
    this.defaultReferer = 'https://pan.baidu.com/disk/home'
    this.defaultConfigData = {
      rpcList: this.defaultRPC,
      configSync: false,
      md5Check: false,
      fold: 0,
      interval: 300,
      downloadPath: '',
      userAgent: this.defaultUserAgent,
      referer: this.defaultReferer,
      headers: ''
    }
    this.configData = {}
    this.on('initConfigData', this.init.bind(this))
    this.on('setConfigData', this.set.bind(this))
    this.on('clearConfigData', this.clear.bind(this))
  }
  init () {
    chrome.storage.sync.get(null, (items) => {
      for (let key in items) {
        chrome.storage.local.set({key: items[key]}, () => {
          console.log('chrome first local set: %s, %s', key, items[key])
        })
      }
    })
    chrome.storage.local.get(null, (items) => {
      this.configData = Object.assign({}, this.defaultConfigData, items)
      this.trigger('updateView', this.configData)
    })
  }
  getConfigData (key = null) {
    if (key) {
      return this.configData[key]
    } else {
      return this.configData
    }
  }
  set (configData) {
    this.configData = configData
    this.save(configData)
    this.trigger('updateView', configData)
  }
  save (configData) {
    for (let key in configData) {
      chrome.storage.local.set({[key]: configData[key]}, () => {
        console.log('chrome local set: %s, %s', key, configData[key])
      })
      if (configData['configSync'] === true) {
        chrome.storage.sync.set({[key]: configData[key]}, () => {
          console.log('chrome sync set: %s, %s', key, configData[key])
        })
      }
    }
  }
  clear () {
    chrome.storage.sync.clear()
    chrome.storage.local.clear()
    this.configData = this.defaultConfigData
    this.trigger('updateView', this.configData)
  }
}

export default new Store()
