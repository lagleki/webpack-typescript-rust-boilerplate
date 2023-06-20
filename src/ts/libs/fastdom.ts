class FastDom {
  writes: any[];
  scheduled: boolean;
  requestAnimationFrame: (cb: FrameRequestCallback) => number;

  constructor() {
    this.writes = [];
    this.scheduled = false;
    this.requestAnimationFrame = window.requestAnimationFrame;
  }

  mutate(fn: unknown) {
    this.writes.push(fn);
    this.#scheduleFlush();
    return fn;
  }

  #catch(e: Error) {
    return console.error(e);
  }

  #scheduleFlush() {
    if (this.scheduled) return;
    this.scheduled = true;
    this.requestAnimationFrame(this.#flush);
  }

  #flush() {
    let error: unknown;

    try {
      let task;
      while ((task = this.writes.shift())) task();
    } catch (e: unknown) {
      error = e;
    }

    this.scheduled = false;

    if (this.writes.length) this.#scheduleFlush();

    if (error) this.#catch(error as Error);
  }
}

declare global {
  interface Window {
    fastdom: FastDom;
  }
}

// FastDom singleton
export default window.fastdom = window.fastdom || new FastDom();
