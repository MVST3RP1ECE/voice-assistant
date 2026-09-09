import { useDispatch, useSelector } from "react-redux"
import { loggedOut, selectAuthStatus, selectCurrentUser, selectIsAuthenticated } from "@/features/auth/AuthSlice"
import type { AppDispatch } from "@/store/store"
import { useLogoutMutation } from "@/features/auth/AuthAPI"

function useAuth() {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector(selectCurrentUser);
    const status = useSelector(selectAuthStatus);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

    const logout = async () => {
        try {
            await logoutMutation().unwrap();
        } finally {
            // Чистим состояние локально независимо от ответа сервера —
            // пользователь должен выйти из UI, даже если сеть отвалилась
            dispatch(loggedOut());
        }
    };

    return { user, status, isAuthenticated, logout, isLoggingOut };
}

export const useAppDispatch = () => useDispatch<AppDispatch>();
// export const useAppSelector = <T>(selector: (state: RootState) => T) => useSelector(selector);

export default useAuth;
