import { loggedOut, setAccessToken } from '@/features/auth/AuthSlice';
import type { IRefreshResponse } from '@/features/auth/types';
import type { RootState } from '@/store/store';
import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
// import env from "dotenv";
// env.config({ path: '.env' });

// Мьютекс нужен, чтобы при параллельных запросах (например, 3 виджета дёрнули
// API одновременно и все получили 401) рефреш токена выполнился ОДИН раз,
// а не N раз параллельно. Это стандартный паттерн из документации RTK Query.
const mutex = new Mutex();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? '/api';

const rawBaseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    // credentials: 'include' обязателен, чтобы браузер отправлял httpOnly
    // refresh-cookie на /auth/refresh и /auth/logout
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.accessToken;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

export const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    await mutex.waitForUnlock()
    let result = await rawBaseQuery(args, api, extraOptions)

    if (result.error.status === 401) {
        // Не долбим /auth/refresh повторными попытками, если он сам вернул 401
        const isRefreshCall = typeof args !== 'string' && args.url === '/auth/refresh';

        if (!isRefreshCall && !mutex.isLocked()) {
            const release = await mutex.acquire();
            try {
                const refreshResult = await rawBaseQuery({ url: '/auth/refresh', method: "POST" }, api, extraOptions)
                if (refreshResult.data) {
                    const { accessToken } = refreshResult.data as IRefreshResponse;
                    api.dispatch(setAccessToken(accessToken));
                    // Повторяем исходный запрос уже с новым токеном
                    result = await rawBaseQuery(args, api, extraOptions);
                } else {
                    // Refresh тоже не удался — сессия окончательно мертва
                    api.dispatch(loggedOut());
                }
            }
            finally {
                release();
            }
        } else if (!isRefreshCall) {
            // Кто-то другой уже рефрешит — просто ждём и повторяем запрос
            await mutex.waitForUnlock();
            result = await rawBaseQuery(args, api, extraOptions);
        }
    }

    return result
}