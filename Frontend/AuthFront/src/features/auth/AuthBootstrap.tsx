import type { AppDispatch } from "@/store/store";
import { useEffect, useState, type ReactNode } from "react";
import { useDispatch } from "react-redux";
import { useRefreshMutation } from "./AuthAPI";
import { loggedOut, setAccessToken } from "./AuthSlice";

interface AuthBootstrapProps {
    children: ReactNode;
    /** Показывается, пока идёт попытка восстановить сессию */
    fallback?: ReactNode;
}

// Оборачивает всё приложение (или роутер) один раз в main.tsx / App.tsx.
// При маунте пытается тихо восстановить access token через httpOnly refresh
// cookie. Пока идёт запрос — показываем fallback, чтобы не мигнуть страницей
// логина на долю секунды у уже залогиненного пользователя.
export function AuthBootstrap({ children, fallback = null }: AuthBootstrapProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [refresh] = useRefreshMutation();
    const [isBootstrapping, setIsBootstrapping] = useState(true);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const result = await refresh().unwrap();
                if (!cancelled) {
                    dispatch(setAccessToken(result.accessToken));
                }
            } catch {
                // Нет валидной refresh-cookie — это нормальный случай для гостя,
                // а не ошибка, которую нужно показывать пользователю
                if (!cancelled) {
                    dispatch(loggedOut());
                }
            } finally {
                if (!cancelled) {
                    setIsBootstrapping(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isBootstrapping) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
