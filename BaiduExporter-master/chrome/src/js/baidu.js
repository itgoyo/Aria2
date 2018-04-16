class Baidu {
  constructor () {
    this.context = window.require('system-core:context/context.js').instanceForSystem
    this.context.log.send = function () {}
  }
  // 封装的百度的Toast提示消息
  // Type类型有
  // caution       警告  failure       失败  loading      加载 success      成功
  showToast ({message, type}) {
    this.context.ui.tip({
      mode: type,
      msg: message
    })
  }
  startListen () {
    window.addEventListener('message', (event) => {
      if (event.data.type && event.data.type === 'getSelected') {
        window.postMessage({ type: 'selected', data: this.context.list.getSelected() }, location.origin)
      }
      if (event.data.type && event.data.type === 'showToast') {
        this.showToast(event.data.data)
      }
    })
    if (window.yunData) {
      // TODO 分析效果
      if (window.yunData.sign2) {
        const yunData = window.require('disk-system:widget/data/yunData.js').get()
        window.postMessage({ type: 'yunData', data: yunData }, location.origin)
      } else {
        window.postMessage({ type: 'yunData', data: JSON.parse(JSON.stringify(window.yunData)) }, location.origin)
      }
    }
  }
}

const baidu = new Baidu()

baidu.startListen()
