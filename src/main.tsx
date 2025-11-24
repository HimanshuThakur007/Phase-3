// src/index.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import AllRoutes from "./router/router.tsx";
import { AuthProvider } from "./common/AuthContext.tsx";
import store from "./redux/store.ts";
import { base_path } from "./environment.ts";
// import initI18n from "./i18n/config.ts";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style/css/feather.css";
import "./style/css/line-awesome.min.css";
import "./style/scss/main.scss";
import "./style/icons/fontawesome/css/fontawesome.min.css";
import "./style/icons/fontawesome/css/all.min.css";
import "./style/css/style.css";
import ModalContainer from "./common/container/ModalContainer.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

const renderApp = async () => {
  // const i18n = await ii18();
  createRoot(rootElement).render(
    <StrictMode>
      <Provider store={store}>
        <AuthProvider>
          <BrowserRouter basename={base_path}>
            <AllRoutes />
            <ModalContainer />
          </BrowserRouter>
        </AuthProvider>
      </Provider>
    </StrictMode>
  );
};

renderApp().catch((error) => {
  console.error("Failed to render app:", error);
});
