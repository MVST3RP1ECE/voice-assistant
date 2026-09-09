import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { Provider } from 'react-redux'
import { store } from "./store/store";
import { AuthBootstrap } from "./features/auth/AuthBootstrap";
import router from "./router/Router";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <Provider store={store}>
    <AuthBootstrap fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </AuthBootstrap>
  </Provider>
);
