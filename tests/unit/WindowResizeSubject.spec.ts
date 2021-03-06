import { WindowResizeSubject } from '~/WindowResizeSubject';

const spies = {
  addEventListener: jest.spyOn(window, 'addEventListener'),
  removeEventListener: jest.spyOn(window, 'removeEventListener'),
};

describe('WindowResizeSubject', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addObserver', () => {
    it('observer is added', () => {
      const mock = jest.fn();
      const subject = new WindowResizeSubject();
      subject.addObserver('test', mock);
      expect(subject['_observers'].get('test')).toBe(mock);
    });

    it('observer is added using Symbol', () => {
      const mock = jest.fn();
      const subject = new WindowResizeSubject();
      const symbol = Symbol('test');
      subject.addObserver(symbol, mock);
      expect(subject['_observers'].get(symbol)).toBe(mock);
    });

    it('observer is called with current window size', () => {
      const mock = jest.fn();
      const subject = new WindowResizeSubject();
      subject.addObserver('test', mock);
      expect(mock).toBeCalledWith({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    });
  });

  describe('deleteObserver', () => {
    it('observer is deleted', () => {
      const mock = jest.fn();
      const subject = new WindowResizeSubject();
      subject.addObserver('test', mock);
      subject.deleteObserver('test');
      expect(subject['_observers'].get('test')).toBeUndefined();
    });

    it('observer is deleted using symbol', () => {
      const mock = jest.fn();
      const subject = new WindowResizeSubject();
      const symbol = Symbol('test');
      subject.addObserver(symbol, mock);
      subject.deleteObserver(symbol);
      expect(subject['_observers'].get(symbol)).toBeUndefined();
    });
  });

  describe('deleteObservers', () => {
    it('observers are deleted', () => {
      const mock = jest.fn();
      const mock2 = jest.fn();
      const subject = new WindowResizeSubject();
      const symbol = Symbol('test');
      subject.addObserver('test', mock);
      subject.addObserver(symbol, mock);
      subject.deleteObservers();
      expect(subject['_observers'].get('test')).toBeUndefined();
      expect(subject['_observers'].get(symbol)).toBeUndefined();
    });
  });

  describe('notifyObservers', () => {
    it('observers are called', () => {
      const observer1 = jest.fn();
      const observer2 = jest.fn();
      const subject = new WindowResizeSubject();
      const symbol = Symbol('test');
      subject.addObserver('test', observer1);
      subject.addObserver(symbol, observer2);

      subject.notifyObservers({ width: 200, height: 100 });

      expect(observer1).toBeCalledWith({ width: 200, height: 100 });
      expect(observer2).toBeCalledWith({ width: 200, height: 100 });
    });
  });

  describe('subscribe', () => {
    it('addEventListener is called with resize', () => {
      const subject = new WindowResizeSubject();
      subject.subscribe();
      expect(spies.addEventListener).toBeCalledWith(
        'resize',
        subject['_handler'],
      );
      subject.unsubscribe();
    });

    it('addEventListener is called with orientationchange', () => {
      const subject = new WindowResizeSubject();
      subject.subscribe();
      expect(spies.addEventListener).toBeCalledWith(
        'orientationchange',
        subject['_handler'],
      );
      subject.unsubscribe();
    });

    it('addEventListener is called once(resize and orientationchange) even if subscribe is called twice', () => {
      const subject = new WindowResizeSubject();
      subject.subscribe();
      subject.subscribe();
      expect(spies.addEventListener).toBeCalledWith(
        'resize',
        subject['_handler'],
      );
      expect(spies.addEventListener).toBeCalledWith(
        'orientationchange',
        subject['_handler'],
      );
      subject.unsubscribe();
    });
  });

  describe('unsubscribe', () => {
    it('removeEventListener is not called before subscribe is called', () => {
      const subject = new WindowResizeSubject();
      subject.unsubscribe();
      expect(spies.removeEventListener).not.toBeCalled();
    });

    it('removeEventListener is called with resize', () => {
      const subject = new WindowResizeSubject();
      subject.subscribe();
      subject.unsubscribe();
      expect(spies.removeEventListener).toBeCalledWith(
        'resize',
        subject['_handler'],
      );
    });

    it('removeEventListener is called with orientationchange', () => {
      const subject = new WindowResizeSubject();
      subject.subscribe();
      subject.unsubscribe();
      expect(spies.removeEventListener).toBeCalledWith(
        'orientationchange',
        subject['_handler'],
      );
    });
  });

  describe('delay', () => {
    it('delay is used by setTimeout', () => {
      const subject = new WindowResizeSubject({ delay: 100 });
      subject.subscribe();
      window.dispatchEvent(new Event('resize'));
      jest.runAllTimers();
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);
      subject.unsubscribe();
    });

    it('delay is updated after setDelay is called', () => {
      const subject = new WindowResizeSubject({ delay: 100 });
      subject.setDelay(200);
      expect(subject['_delay']).toBe(200);
    });
  });

  describe('resize envet', () => {
    it('notifyObservers is called', () => {
      const subject = new WindowResizeSubject();
      subject.subscribe();
      const spy = jest.spyOn(subject, 'notifyObservers');
      window.dispatchEvent(new Event('resize'));
      jest.runAllTimers();
      expect(spy).toBeCalledTimes(1);
      subject.unsubscribe();
    });
  });

  describe('hasObserver', () => {
    it('initail value is false', () => {
      const subject = new WindowResizeSubject();
      expect(subject.hasObserver()).toBe(false);
    });

    it('has after adding an observer', () => {
      const mock = jest.fn();
      const subject = new WindowResizeSubject();
      subject.addObserver('test', mock);
      expect(subject.hasObserver()).toBe(true);
    });

    it('not has after adding and deleting', () => {
      const mock = jest.fn();
      const subject = new WindowResizeSubject();
      subject.addObserver('test', mock);
      subject.deleteObserver('test');
      expect(subject.hasObserver()).toBe(false);
    });
  });

  describe('dispatch', () => {
    it('observer is called with window size', () => {
      const observer = jest.fn();
      const subject = new WindowResizeSubject();
      subject.addObserver('test', observer);

      observer.mockClear();
      subject.dispatch();

      expect(observer).toBeCalledWith({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    });
  });
});
