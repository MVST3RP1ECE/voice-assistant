import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/AuthSlice"
import { authApi } from "../features/auth/AuthAPI"


export const store = configureStore({
    reducer: {
        auth: authReducer,
        [authApi.reducerPath]: authApi.reducer,
    },
    // authApi.middleware добавляет кэширование, поллинг, инвалидацию тегов и т.д.
    // Без него RTK Query не будет работать
    middleware: (getDefault) => getDefault().concat(authApi.middleware),
    // Полезно на время разработки — RTK Query триггерит refetchOnFocus/refetchOnReconnect
    devTools: import.meta.env.MODE !== 'prod',
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch