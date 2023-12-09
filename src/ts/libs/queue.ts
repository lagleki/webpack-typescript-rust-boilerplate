type Item = {
  name?: string;
  priority?: number;
  action: any;
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
};

export class AutoQueue {
  private _items: Item[] = [];
  
  _pendingPromise: boolean;
  constructor() {
    this._pendingPromise = false;
  }
  
  get size() {
    return this._items.length;
  }

  enqueue({ action, name, priority }: { action: unknown; priority?: number; name?: string }) {
    return new Promise((resolve, reject) => {
      this._items.push({ action, name, priority, resolve, reject });
      this.dequeue();
    });
  }

  async dequeue() {
    if (this._pendingPromise) return;

    const withVlaste = this._items.filter((i) => i.name === "vlaste").slice(-1);
    const notWithVlaste = this._items
      .filter((i) => i.name !== "vlaste")
      .sort((a, b) => (b.priority ?? 0.5) - (a.priority ?? 0.5));
    this._items = [...withVlaste, ...notWithVlaste];

    const item = this._items.shift();

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
