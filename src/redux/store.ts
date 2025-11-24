import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist-indexeddb-storage";
import createTransform from "redux-persist/es/createTransform";

// Import your reducers
import rootReducer from "./reducer";
import modalReducer from "./modalSlice";
import sidebarReducer from "./sidebarSlice";
import formReducer from "./formSlice";
import dashboardslice from "./dashboardSlice";
import dashboardspslice from "./dashboardSpSlice";
import dashboardcriticalslice from "./dashboardCritical";
import authDataReducer from "./authDataSlice";
import subDashboardReducer from "./subDashboardSlice";
import tranSidebarReducer from "./transactionSidebarSlice";
import expenseReducer from "./expenseDataSlice";
import dash from "./dashboardModalSlice";
import phase3Slice from "./phase3Slice";
import reportDetailReducer from "./reportDetailSlice";
import schemeReducer from "./schemeSlice";
import schemeOptionsReducer from "./schemeOptionsSlice";
// import phase3FiltersReducer from "./phase3FiltersSlice";

// Persist config
const persistConfig = {
  key: "root",
  storage: storage("BowBI"),
  transforms: [
    createTransform(
      (inboundState) => inboundState,
      (outboundState) => outboundState,
      { whitelist: ["dynamicForm", "authData", "modal"] }
    ),
  ],
  blacklist: [],
};

const combinedReducer: any = combineReducers({
  root: rootReducer,
  modal: modalReducer,
  sidebar: sidebarReducer,
  transidebar: tranSidebarReducer,
  dynamicForm: formReducer,
  dashboard: dashboardslice,
  dashboardsp: dashboardspslice,
  dashboardCritical: dashboardcriticalslice,
  authData: authDataReducer,
  dashData: subDashboardReducer,
  expenseData: expenseReducer,
  dashboardModal: dash,
  phase3: phase3Slice,
  reportDetail: reportDetailReducer,
  scheme: schemeReducer,
  schemeOptions: schemeOptionsReducer
  // phase3Filters: phase3FiltersReducer
});

const persistedReducer = persistReducer(persistConfig, combinedReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

// Function to clear IndexedDB storage, including database structure, on logout
export const clearPersistedStorage = async () => {
  try {
    // First, purge the redux-persist data
    await persistor.purge();
    console.log("Redux-persist data cleared.");

    // Delete the entire "BPCL" IndexedDB database
    const deleteRequest = window.indexedDB.deleteDatabase("BPCL");

    return new Promise<void>((resolve, reject) => {
      deleteRequest.onsuccess = () => {
        console.log("IndexedDB database 'BowBI' deleted successfully.");
        resolve();
      };
      deleteRequest.onerror = () => {
        console.error("Error deleting IndexedDB database 'BowBI'.");
        reject(new Error("Failed to delete IndexedDB database."));
      };
      deleteRequest.onblocked = () => {
        console.warn(
          "Deletion of IndexedDB database 'BowBI' blocked; ensure all connections are closed."
        );
        reject(new Error("Database deletion blocked."));
      };
    });
  } catch (error) {
    console.error("Error clearing IndexedDB storage:", error);
    throw error;
  }
};

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
