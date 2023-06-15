class Queue {
  constructor() {
    this._items = []
  }
  enqueue(item) {
    this._items.push(item)
  }
  dequeue() {
    const withVlaste = this._items.filter((i) => i.name === 'vlaste').slice(-1)
    const notWithVlaste = this._items.filter((i) => i.name !== 'vlaste')
    this._items = notWithVlaste.concat(withVlaste)
    return this._items.shift()
  }
  get size() {
    return this._items.length
  }
}

export class AutoQueue extends Queue {
  constructor() {
    super()
    this._pendingPromise = false
  }

  enqueue(action, name) {
    return new Promise((resolve, reject) => {
      super.enqueue({ name, action, resolve, reject })
      this.dequeue()
    })
  }

  async dequeue() {
    if (this._pendingPromise) return false

    const item = super.dequeue()

    if (!item) return false

    try {
      this._pendingPromise = true
      const payload = await item.action(this)

      this._pendingPromise = false
      item.resolve(payload)
    } catch (e) {
      this._pendingPromise = false
      item.reject(e)
    } finally {
      this.dequeue()
    }

    return true
  }
}
