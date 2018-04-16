import Core from './core'

class Downloader {
  constructor (listParameter) {
    this.listParameter = listParameter
    this.fileDownloadInfo = []
    this.currentTaskId = 0
    this.completedCount = 0
    this.folders = []
    this.files = {}
  }
  start (interval = 300, done) {
    this.interval = interval
    this.done = done
    this.currentTaskId = new Date().getTime()
    this.getNextFile(this.currentTaskId)
  }
  reset () {
    this.fileDownloadInfo = []
    this.currentTaskId = 0
    this.folders = []
    this.files = {}
    this.completedCount = 0
  }
  addFolder (path) {
    this.folders.push(path)
  }
  addFile (file) {
    this.files[file.fs_id] = file
  }
  getNextFile (taskId) {
    if (taskId !== this.currentTaskId) {
      return
    }
    if (this.folders.length !== 0) {
      this.completedCount++
      Core.showToast(`正在获取文件列表... ${this.completedCount}/${this.completedCount + this.folders.length - 1}`, 'success')
      const dir = this.folders.pop()
      this.listParameter.search.dir = dir
      fetch(`${window.location.origin}${this.listParameter.url}${Core.objectToQueryString(this.listParameter.search)}`, this.listParameter.options).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            setTimeout(() => this.getNextFile(taskId), this.interval)
            if (data.errno !== 0) {
              Core.showToast('未知错误', 'failure')
              console.log(data)
              return
            }
            data.list.forEach((item) => {
              if (item.isdir) {
                this.folders.push(item.path)
              } else {
                this.files[item.fs_id] = item
              }
            })
          })
        } else {
          console.log(response)
        }
      }).catch((err) => {
        Core.showToast('网络请求失败', 'failure')
        console.log(err)
        setTimeout(() => this.getNextFile(taskId), this.interval)
      })
    } else if (this.files.length !== 0) {
      Core.showToast('正在获取下载地址...', 'success')
      this.getFiles(this.files).then(() => {
        this.done(this.fileDownloadInfo)
      })
    } else {
      Core.showToast('一个文件都没有哦...', 'caution')
      this.reset()
    }
  }

  getFiles (files) {
    throw new Error('subclass should implement this method!')
  }
}

export default Downloader
