type Item = {name?: string; action: any;resolve: (value: unknown) => void; reject: (reason?: any) => void}
class Queue {
  private _items:Item[] = [];

  enqueue(item: Item) {
    this._items.push(item);
  }

  async dequeue() {
    console.log(this._items);
    const withVlaste = this._items.filter((i) => i.name === "vlaste").slice(-1);
    const notWithVlaste = this._items.filter((i) => i.name !== "vlaste");
    if (withVlaste.length>0){
      console.log('vlll', withVlaste);
    }
    this._items = [...withVlaste, ...notWithVlaste];
    return this._items.shift();
  }

  get size() {
    return this._items.length;
  }
}

export class AutoQueue extends Queue {
  _pendingPromise: boolean;
  constructor() {
    super();
    this._pendingPromise = false;
  }

  enqueue({ action,name }: { action: unknown; name?: string }) {
    return new Promise((resolve, reject) => {
      super.enqueue({ action, name, resolve, reject });
      this.dequeue();
    });
  }

  async dequeue() {
    if (this._pendingPromise) return;

    const item = await super.dequeue();

    if (!item) return;

    try {
      this._pendingPromise = true;
      const payload = await item.action(this);

      this._pendingPromise = false;
      item.resolve(payload);
    } catch (e) {
      this._pendingPromise = false;
      item.reject(e);
    } finally {
      this.dequeue();
    }

    return item;
  }
}
