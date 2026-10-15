/**
 * Trail maps saved on this device for offline viewing. Stored in IndexedDB (a few MB of image each), one row per
 * account and trail, so signing in as someone else on the same phone shows that account's downloads only.
 */
export interface OfflineTrail {
    key: string;
    userId: string;
    trailId: string;
    title: string;
    savedAt: number;
    image: Blob;
}

const DB_NAME = 'tbp-offline';
const STORE = 'trails';

const openDb = () => new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
        reject(new Error('Offline storage is not available in this browser.'));
        return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'key' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Offline storage could not be opened.'));
});

const run = async <T,>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
    const db = await openDb();
    try {
        return await new Promise<T>((resolve, reject) => {
            const request = work(db.transaction(STORE, mode).objectStore(STORE));
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error('Offline storage failed. Free some space and try again.'));
        });
    } finally {
        db.close();
    }
};

const keyFor = (userId: string, trailId: string) => `${userId}:${trailId}`;

export const listOfflineTrails = async (userId: string): Promise<OfflineTrail[]> => {
    try {
        const all = await run<OfflineTrail[]>('readonly', (store) => store.getAll());
        return all.filter((item) => item.userId === userId).sort((a, b) => b.savedAt - a.savedAt);
    } catch {
        return [];
    }
};

export const saveOfflineTrail = async (userId: string, trailId: string, title: string, image: Blob) => {
    const item: OfflineTrail = { key: keyFor(userId, trailId), userId, trailId, title, savedAt: Date.now(), image };
    await run('readwrite', (store) => store.put(item));
};

export const deleteOfflineTrail = async (userId: string, trailId: string) => {
    await run('readwrite', (store) => store.delete(keyFor(userId, trailId)));
};
