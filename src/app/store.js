import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import { combineReducers } from "redux";
import chatReducer from "../features/chat/chatSlice";
import interviewReducer from "../features/interview/interviewSlice";
const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  chat: chatReducer,
  interview: interviewReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
