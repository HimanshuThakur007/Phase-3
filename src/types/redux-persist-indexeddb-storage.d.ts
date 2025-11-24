declare module "redux-persist-indexeddb-storage" {
    import { Storage } from "redux-persist";
  
    interface IndexedDBStorageOptions {
      name?: string;
      storeName?: string;
      dbVersion?: number;
      keyPath?: string;
      databaseName:string
    }
  
    export default function createIdbStorage(options?:string | IndexedDBStorageOptions): Storage;
  }
  