import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface EventManagementDB extends DBSchema {
  event_requests: {
    key: string;
    value: {
      id: string;
      name: string;
      email: string;
      phone: string;
      eventType: string;
      date: string;
      guestCount: string;
      requirements: string;
      status: string;
      created_at: string;
    };
  };
  contact_messages: {
    key: string;
    value: {
      id: string;
      name: string;
      email: string;
      message: string;
      created_at: string;
    };
  };
  gallery: {
    key: string;
    value: {
      id: string;
      title: string;
      image_url: string;
      category: string;
      description: string;
      created_at: string;
    };
  };
  products: {
    key: string;
    value: {
      id: string;
      name: string;
      description: string;
      price: string;
      image_url: string;
      created_at: string;
    };
  };
  testimonials: {
    key: string;
    value: {
      id: string;
      name: string;
      role: string;
      content: string;
      rating: number;
      avatar_url: string;
      created_at: string;
    };
  };
}

let db: IDBPDatabase<EventManagementDB>;

export async function initDB(): Promise<IDBPDatabase<EventManagementDB>> {
  if (db) return db;

  db = await openDB<EventManagementDB>('EventManagementDB', 1, {
    upgrade(db) {
      // Create object stores for each table
      if (!db.objectStoreNames.contains('event_requests')) {
        db.createObjectStore('event_requests', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('contact_messages')) {
        db.createObjectStore('contact_messages', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('gallery')) {
        db.createObjectStore('gallery', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('testimonials')) {
        db.createObjectStore('testimonials', { keyPath: 'id' });
      }
    },
  });

  return db;
}

export async function add<T>(storeName: keyof EventManagementDB, data: T): Promise<void> {
  const database = await initDB();
  const tx = database.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  
  // Generate ID if not provided
  const item = {
    ...data,
    id: (data as any).id || crypto.randomUUID(),
    created_at: (data as any).created_at || new Date().toISOString()
  };
  
  await store.add(item as any);
  await tx.done;
}

export async function getAll<T>(storeName: keyof EventManagementDB): Promise<T[]> {
  const database = await initDB();
  const tx = database.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const result = await store.getAll();
  await tx.done;
  return result as T[];
}

export async function update<T>(storeName: keyof EventManagementDB, id: string, data: Partial<T>): Promise<void> {
  const database = await initDB();
  const tx = database.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  
  const existing = await store.get(id);
  if (existing) {
    const updated = { ...existing, ...data };
    await store.put(updated);
  }
  
  await tx.done;
}

export async function remove(storeName: keyof EventManagementDB, id: string): Promise<void> {
  const database = await initDB();
  const tx = database.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.delete(id);
  await tx.done;
}

export async function clear(storeName: keyof EventManagementDB): Promise<void> {
  const database = await initDB();
  const tx = database.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.clear();
  await tx.done;
}