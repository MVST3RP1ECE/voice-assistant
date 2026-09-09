export interface IUser {
    id: string,
    email: string,
    name: string,
    role?: string
}

export interface IAuthResponse {
    accessToken: string,
    user: IUser,
}

export interface ILoginRequest {
    email: string,
    password: string,
}

export interface IRegisterRequest {
    email: string,
    password: string,
    name: string,
}

export interface IRefreshResponse {
    accessToken: string
}

export interface IApiErrorBody {
    error: string,
    message: string,
    fields?: Record<string, string>
}

export type IAuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'