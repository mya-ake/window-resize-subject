import type {
  Subject,
  WindowResizeObserver,
  WindowResizeSubjectEvent,
  ObserverName,
} from './type';

export class WindowResizeSubject implements Subject<WindowResizeSubjectEvent> {
  private _observers: Map<ObserverName, WindowResizeObserver> = new Map();
  private _delay: number;
  private _timer: number | undefined;
  private _subscribed = false;
  private _handler: () => void;

  constructor({ delay = 33 } = {}) {
    this._delay = delay;
    this._handler = this._handleResize.bind(this);
  }

  addObserver(name: ObserverName, observer: WindowResizeObserver) {
    this._observers.set(name, observer);
    return this;
  }

  deleteObserver(name: ObserverName) {
    this._observers.delete(name);
    return this;
  }

  deleteObservers() {
    this._observers.clear();
    return this;
  }

  notifyObservers(event: WindowResizeSubjectEvent) {
    this._observers.forEach((observer) => {
      observer(event);
    });
    return this;
  }

  subscribe() {
    if (typeof window === 'undefined') {
      return this;
    }
    if (this._subscribed) {
      return this;
    }
    this._update();
    window.addEventListener('resize', this._handler);
    window.addEventListener('orientationchange', this._handler);
    this._subscribed = true;
    return this;
  }

  unsubscribe() {
    if (!this._subscribed) {
      return this;
    }
    window.removeEventListener('resize', this._handler);
    window.removeEventListener('orientationchange', this._handler);
    this._subscribed = false;
    return this;
  }

  setDelay(delay: number) {
    this._delay = delay;
    return this;
  }

  hasObserver(): boolean {
    return this._observers.size > 0;
  }

  private _update() {
    this.notifyObservers({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  private _handleResize() {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this._update();
    }, this._delay);
  }
}
