import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface EventsDB extends DBSchema {
  contact_messages: {
    key: string;
    value: {
      id: string;
      created_at: string;
      name: string;
      email: string;
      message: string;
      viewed?: boolean;
    };
    indexes: { 'by-date': string };
  };
  event_requests: {
    key: string;
    value: {
      id: string;
      created_at: string;
      name: string;
      email: string;
      phone: string;
      eventType: string;
      date: string;
      guestCount: string;
      requirements: string;
      status: 'pending' | 'ongoing' | 'completed';
    };
    indexes: { 'by-date': string };
  };
  gallery: {
    key: string;
    value: {
      id: string;
      created_at: string;
      title: string;
      image_url: string;
      category: string;
      description?: string;
    };
    indexes: { 'by-date': string };
  };
  products: {
    key: string;
    value: {
      id: string;
      created_at: string;
      name: string;
      description: string;
      price: string;
      image_url: string;
    };
    indexes: { 'by-date': string };
  };
  testimonials: {
    key: string;
    value: {
      id: string;
      created_at: string;
      name: string;
      role: string;
      content: string;
      rating: number;
      avatar_url: string;
    };
    indexes: { 'by-date': string };
  };
}

let db: IDBPDatabase<EventsDB>;

function createStore(db: IDBPDatabase<EventsDB>, name: keyof EventsDB) {
  if (!db.objectStoreNames.contains(name)) {
    const store = db.createObjectStore(name, { keyPath: 'id' });
    store.createIndex('by-date', 'created_at');
  }
}

export async function initDB() {
  if (db) return db;
  
  try {
    db = await openDB<EventsDB>('events-db', 2, {
      async upgrade(db, oldVersion, newVersion, transaction) {
        createStore(db, 'contact_messages');
        createStore(db, 'event_requests');
        createStore(db, 'gallery');
        createStore(db, 'products');
        createStore(db, 'testimonials');
        
        // Migration for existing data to add new fields
        if (oldVersion < 2) {
          // Add viewed field to existing messages
          if (db.objectStoreNames.contains('contact_messages')) {
            const store = transaction.objectStore('contact_messages');
            const messages = await store.getAll();
            for (const message of messages) {
              if (message.viewed === undefined) {
                message.viewed = false;
                await store.put(message);
              }
            }
          }
          
          // Update event status for existing events
          if (db.objectStoreNames.contains('event_requests')) {
            const store = transaction.objectStore('event_requests');
            const events = await store.getAll();
            for (const event of events) {
              if (!event.status || event.status === 'pending') {
                event.status = 'pending';
                await store.put(event);
              }
            }
          }
        }
      },
    });
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

export async function getAll<T>(storeName: keyof EventsDB): Promise<T[]> {
  try {
    if (!db) {
      await initDB();
    }
    const store = db.transaction(storeName, 'readonly').objectStore(storeName);
    return await store.getAll();
  } catch (error) {
    console.error(`Failed to get items from ${storeName}:`, error);
    return [];
  }
}

export async function add<T extends { id?: string }>(storeName: keyof EventsDB, item: T) {
  try {
    if (!db) {
      await initDB();
    }
    const newItem = {
      ...item,
      id: item.id || crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    await db.add(storeName, newItem);
    return newItem;
  } catch (error) {
    console.error(`Failed to add item to ${storeName}:`, error);
    throw error;
  }
}

export async function update<T>(storeName: keyof EventsDB, id: string, item: T) {
  try {
    if (!db) {
      await initDB();
    }
    await db.put(storeName, { ...item, id });
    return item;
  } catch (error) {
    console.error(`Failed to update item in ${storeName}:`, error);
    throw error;
  }
}

export async function remove(storeName: keyof EventsDB, id: string) {
  try {
    if (!db) {
      await initDB();
    }
    await db.delete(storeName, id);
  } catch (error) {
    console.error(`Failed to remove item from ${storeName}:`, error);
    throw error;
  }
}

// Initialize the database when the module loads
initDB().catch(console.error);