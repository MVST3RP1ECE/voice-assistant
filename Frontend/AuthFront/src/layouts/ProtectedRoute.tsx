import { useAuth } from "@/hooks";
import { Navigate, Outlet, useLocation } from "react-router";


export function ProtectedRoute() {
    const { isAuthenticated, status } = useAuth();
    const location = useLocation();
    // status === 'loading' сюда почти никогда не попадает, если AuthBootstrap
    // оборачивает роутер выше, но проверка - дешёвая страховка от гонки состояний

    if (status === 'idle' || status === 'loading') return null;
    if (!isAuthenticated) {
        // Запоминаем откуда пришли, чтобы после логина вернуть пользователя
        // на исходную страницу, а не всегда кидать на "/"
        return <Navigate to="/login" state={{ from: location }} replace />
    }
    // Рендерим вложенный роут, если он совпал, иначе ничего. В нашем случае вложенные роуты
    return <Outlet />;
}

// Обратный случай: залогиненный пользователь не должен видеть /login и /register
export function PublicRoute() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}