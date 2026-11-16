export class QuranAudioStorage {
  private readonly dbName: string;
  private readonly storeName: string;

  constructor(dbName = 'QuranOfflineDB', storeName = 'audio_files') {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  private async _openDB(): Promise<IDBDatabase> {
    if (typeof indexedDB === 'undefined') {
      throw new Error('IndexedDB is not available in this environment');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async saveAudio(surahId: string | number, blobData: Blob): Promise<boolean> {
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(blobData, surahId.toString());

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  }

  async getAudio(surahId: string | number): Promise<Blob | null> {
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(surahId.toString());

      request.onsuccess = () => resolve((request.result as Blob | undefined) || null);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  }

  async hasAudio(surahId: string | number): Promise<boolean> {
    const audio = await this.getAudio(surahId);
    return audio !== null;
  }

  async deleteAudio(surahId: string | number): Promise<void> {
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(surahId.toString());

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  }

  async listKeys(): Promise<string[]> {
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onsuccess = () =>
        resolve((request.result as IDBValidKey[]).map((key) => String(key)));
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  }

  async getTotalBytes(): Promise<number> {
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const blobs = (request.result as Blob[]) || [];
        const total = blobs.reduce((acc, item) => acc + (item?.size || 0), 0);
        resolve(total);
      };
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  }

  async clearAll(): Promise<void> {
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  }
}

export const audioStorage = new QuranAudioStorage();
