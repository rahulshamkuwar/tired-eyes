// Type definitions for electron-store
declare module "electron-store" {
  interface Options<T> {
    defaults?: T;
    name?: string;
  }

  class ElectronStore<T> {
    constructor(options?: Options<T>);
    store: T;
    set<K extends keyof T>(key: K, value: T[K]): void;
    set(object: Partial<T>): void;
    get<K extends keyof T>(key: K): T[K];
  }

  export = ElectronStore;
}
