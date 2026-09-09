import { ProtectedRoute, PublicRoute } from "@/layouts/ProtectedRoute";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { createBrowserRouter } from "react-router";


const router = createBrowserRouter([
    {
        element: <PublicRoute />,
        children: [
            { path: "/login", element: <Login /> },
            { path: "/register", element: <Register /> },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            { path: "/", element: <Home /> }
        ]
    }
]);

export default router