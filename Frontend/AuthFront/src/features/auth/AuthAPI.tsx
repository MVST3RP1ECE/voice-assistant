import { createApi } from "@reduxjs/toolkit/query/react"
import type { IAuthResponse, ILoginRequest, IRefreshResponse, IRegisterRequest, IUser } from "./types";
import { baseQueryWithReauth } from "@/lib/baseQueryWithReauth";


export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['CurrentUser'],
    endpoints: (builder) => ({

        login: builder.mutation<IAuthResponse, ILoginRequest>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,

            }),
            invalidatesTags: ['CurrentUser'],
        }),

        register: builder.mutation<IAuthResponse, IRegisterRequest>({
            query: (payload) => ({
                url: '/auth/register',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['CurrentUser'],
        }),

        // Дёргается один раз при старте приложения (AuthBootstrap) для восстановления
        // сессии по httpOnly cookie, и автоматически baseQueryWithReauth при 401
        refresh: builder.mutation<IRefreshResponse, void>({
            query: () => ({ url: '/auth/refresh', method: "POST" })
        }),

        logout: builder.mutation<void, void>({
            query: () => ({ url: '/auth/logout', method: "POST" })
        }),

        getMe: builder.query<IUser, void>({
            query: () => '/auth/me',
            providesTags: ['CurrentUser'],
        }),

        ping: builder.query<void, void>({
            query: () => ({ url: '/ping', method: 'GET' }),

        })
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useRefreshMutation,
    useLogoutMutation,
    useGetMeQuery,
    useLazyGetMeQuery,
    usePingQuery,
} = authApi;