export type Observer<Event = void> = (event: Event) => void;

export type ObserverName = string | Symbol;

export interface Subject<Event = void> {
  addObserver(name: ObserverName, observer: Observer<Event>): this;
  deleteObserver(name: ObserverName): this;
  notifyObservers(event: Event): this;
  subscribe(): this;
  unsubscribe(): this;
}

export type WindowResizeObserver = Observer<WindowResizeSubjectEvent>;
export type WindowResizeSubjectEvent = {
  width: number;
  height: number;
};
export type WindowResizeSubjectOption = {
  delay?: number;
};
