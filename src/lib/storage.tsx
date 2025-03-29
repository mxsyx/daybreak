/* eslint-disable @typescript-eslint/ban-ts-comment */

class Storage {
  // @ts-ignore
  #db: IDBDatabase;
  #name: string

  constructor(name: string) {
    this.#name = name;
    const request = indexedDB.open('assets', 1);
    request.onupgradeneeded = (event) => {
      // @ts-ignore
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(name)) {
        db.createObjectStore(name);
      }
    };

    request.onsuccess = (event) => {
      // @ts-ignore
      this.#db = event.target.result;
    };
    
    request.onerror = (event) => {
      // @ts-ignore
      console.error('数据库打开失败', event.target.error);
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put(key: string, value: any) {
    const transaction = this.#db.transaction(this.#name, 'readwrite');
    const objectStore = transaction.objectStore(this.#name);
    objectStore.put(value, key); 
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export const storages = {
  background: new Storage('background'),
  music: new Storage('music'),
  sound: new Storage('sound'),
  image: new Storage('image'),
  sticker: new Storage('sticker'),
  video: new Storage('video'),
  layout: new Storage('layout'),
}

export default Storage;
