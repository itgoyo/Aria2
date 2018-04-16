class EventEmitter {
  constructor () {
    this._listeners = {}
  }

  /**
   * @param {string} name - event name
   * @param {function(data: *): void} fn - listener function
   */
  on (name, fn) {
    const list = this._listeners[name] = this._listeners[name] || []
    list.push(fn)
  }

  /**
   * @param {string} name - event name
   * @param {*} data - data to emit event listeners
   */
  trigger (name, data) {
    const fns = this._listeners[name] || []
    fns.forEach(fn => fn(data))
  }

  /**
   * @param {string} name - event name
   */
  off (name) {
    delete this._listeners[name]
  }
}

export default EventEmitter
