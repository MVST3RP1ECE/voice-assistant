import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IAuthStatus, IUser } from "./types";


interface IAuthState {
    accessToken: string | null,
    user: IUser | null,
    status: IAuthStatus
}

interface IPayloadAction {
    accessToken: string,
    user?: IUser
}

const initialState: IAuthState = {
    accessToken: null,
    user: null,
    status: 'idle',
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<IPayloadAction>
        ) => {
            state.accessToken = action.payload.accessToken;
            if (action.payload.user) {
                state.user = action.payload.user;
            }
            state.status = 'authenticated';
        },

        // Используется baseQueryWithReauth после успешного silent refresh,
        // когда пользователь уже известен и нужно обновить только токен

        setAccessToken: (
            state,
            action: PayloadAction<string>) => {
            state.accessToken = action.payload;
            state.status = 'authenticated';
        },

        setBootstrapping: (state) => {
            state.status = 'loading';
        },

        loggedOut: (state) => {
            state.accessToken = null;
            state.user = null;
            state.status = 'unauthenticated';
        },

    },
});

export const { setAccessToken, setBootstrapping, setCredentials, loggedOut } = authSlice.actions
const authReducer = authSlice.reducer
export default authReducer;


// Селекторы
export const selectCurrentUser = (state: { auth: IAuthState }) => state.auth.user
export const selectAccessToken = (state: { auth: IAuthState }) => state.auth.accessToken
export const selectAuthStatus = (state: { auth: IAuthState }) => state.auth.status
export const selectIsAuthenticated = (state: { auth: IAuthState }) => state.auth.status === 'authenticated'