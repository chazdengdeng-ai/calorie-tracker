import { onMounted, ref } from "vue";
import { genId } from "@/utils/date";

export interface FoodRecord {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  calories: number;
  timestamp: number;
}

export interface ExerciseRecord {
  id: string;
  date: string;
  name: string;
  calories: number;
  timestamp: number;
}

const DB_NAME = "calorie-tracker";
const DB_VERSION = 1;
const STORE_FOOD = "foods";
const STORE_EXERCISE = "exercises";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_FOOD)) {
        const fs = db.createObjectStore(STORE_FOOD, { keyPath: "id" });
        fs.createIndex("date", "date", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_EXERCISE)) {
        const es = db.createObjectStore(STORE_EXERCISE, { keyPath: "id" });
        es.createIndex("date", "date", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function withStore<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(store, mode);
    const s = tx.objectStore(store);
    const req = fn(s);
    tx.oncomplete = () => resolve(req ? req.result : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function getAllByIndex<T>(
  store: string,
  index: string,
  value: string,
): Promise<T[]> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(store, "readonly");
    const s = tx.objectStore(store);
    const idx = s.index(index);
    const req = idx.getAll(value);
    tx.oncomplete = () => resolve((req.result as T[]) || []);
    tx.onerror = () => reject(tx.error);
  });
}

function getAll<T>(store: string): Promise<T[]> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(store, "readonly");
    const s = tx.objectStore(store);
    const req = s.getAll();
    tx.oncomplete = () => resolve((req.result as T[]) || []);
    tx.onerror = () => reject(tx.error);
  });
}

export function useDB() {
  const ready = ref(false);

  onMounted(async () => {
    try {
      await openDB();
      ready.value = true;
    } catch (e) {
      console.error("IndexedDB init failed", e);
    }
  });

  async function addFood(
    data: Omit<FoodRecord, "id" | "timestamp">,
  ): Promise<void> {
    const record: FoodRecord = {
      ...data,
      id: genId(),
      timestamp: Date.now(),
    };
    await withStore(STORE_FOOD, "readwrite", (s) => s.add(record));
  }

  async function addExercise(
    data: Omit<ExerciseRecord, "id" | "timestamp">,
  ): Promise<void> {
    const record: ExerciseRecord = {
      ...data,
      id: genId(),
      timestamp: Date.now(),
    };
    await withStore(STORE_EXERCISE, "readwrite", (s) => s.add(record));
  }

  async function deleteFood(id: string): Promise<void> {
    await withStore(STORE_FOOD, "readwrite", (s) => s.delete(id));
  }

  async function deleteExercise(id: string): Promise<void> {
    await withStore(STORE_EXERCISE, "readwrite", (s) => s.delete(id));
  }

  async function getFoodsByDate(date: string): Promise<FoodRecord[]> {
    const list = await getAllByIndex<FoodRecord>(STORE_FOOD, "date", date);
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }

  async function getExercisesByDate(
    date: string,
  ): Promise<ExerciseRecord[]> {
    const list = await getAllByIndex<ExerciseRecord>(
      STORE_EXERCISE,
      "date",
      date,
    );
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }

  async function getAllDatesSummary(): Promise<
    { date: string; intake: number; burn: number }[]
  > {
    const foods = await getAll<FoodRecord>(STORE_FOOD);
    const exercises = await getAll<ExerciseRecord>(STORE_EXERCISE);
    const map = new Map<
      string,
      { date: string; intake: number; burn: number }
    >();
    for (const f of foods) {
      const cur = map.get(f.date) || { date: f.date, intake: 0, burn: 0 };
      cur.intake += Number(f.calories) || 0;
      map.set(f.date, cur);
    }
    for (const e of exercises) {
      const cur = map.get(e.date) || { date: e.date, intake: 0, burn: 0 };
      cur.burn += Number(e.calories) || 0;
      map.set(e.date, cur);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.date < b.date ? 1 : -1,
    );
  }

  return {
    ready,
    addFood,
    addExercise,
    deleteFood,
    deleteExercise,
    getFoodsByDate,
    getExercisesByDate,
    getAllDatesSummary,
  };
}
