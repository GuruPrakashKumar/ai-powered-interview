import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import chatReducer from "../features/chat/chatSlice";
import interviewReducer from "../features/interview/interviewSlice";
import candidatesReducer from "../features/candidates/candidatesSlice";
const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  chat: chatReducer,
  interview: interviewReducer,
  candidates: candidatesReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
