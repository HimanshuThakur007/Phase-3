import React, { Suspense, lazy, useEffect } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import { pagesRoute } from "./router.link";
import CenteredLoader from "../common/component/CenteredLoader";
import { RootState } from "../redux/store";
// import { useDispatch } from "react-redux";

// Lazy load components
// const Sidebar = lazy(() => import("../InitialPage/Sidebar/Sidebar"));
// const Header = lazy(() => import("../InitialPage/Sidebar/Header"));
const ThemeSettings = lazy(() => import("../InitialPage/themeSettings"));
// const PrivateRoute = lazy(
//   () => import("../feature-modules/authentication/login/PrivateRoute")
// );
// const Toast = lazy(() => import("../common/component/Toaster"));

// Define route config type
interface RouteConfig {
  id: number;
  path: string;
  name: string;
  element: React.ReactElement;
}

const AllRoutes: React.FC = () => {
  const data = useSelector((state: RootState) => state.root.toggle_header);
  const isDemoDomain = window.location.hostname === "localhost";
  useEffect(() => {
    if (!isDemoDomain) {
      const disableSave = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === "s") {
          e.preventDefault();
        }
      };
      const disableShortcuts = (e: KeyboardEvent) => {
        if (
          e.key === "F12" ||
          (e.ctrlKey &&
            e.shiftKey &&
            (e.key === "I" || e.key === "J" || e.key === "C")) ||
          (e.ctrlKey && e.key === "U")
        ) {
          e.preventDefault();
        }
      };
      const handleContextMenu = (e: MouseEvent) => e.preventDefault();
      const handleCopy = (e: ClipboardEvent) => e.preventDefault();
      const handleCut = (e: ClipboardEvent) => e.preventDefault();
      const handleSelectStart = (e: Event) => e.preventDefault();

      document.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("copy", handleCopy);
      document.addEventListener("cut", handleCut);
      document.addEventListener("selectstart", handleSelectStart);
      document.addEventListener("keydown", disableShortcuts);
      document.addEventListener("keydown", disableSave);

      return () => {
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("copy", handleCopy);
        document.removeEventListener("cut", handleCut);
        document.removeEventListener("selectstart", handleSelectStart);
        document.removeEventListener("keydown", disableShortcuts);
        document.addEventListener("keydown", disableSave);
      };
    }
  }, []);



  //   <div className={`main-wrapper ${data ? "header-collapse" : ""}`}>
  //     <Suspense fallback={<CenteredLoader />}>
  //       <Header />
  //     </Suspense>
  //     <Suspense fallback={<CenteredLoader />}>
  //       <Sidebar />
  //     </Suspense>
  //     <Outlet />
  //     <Suspense fallback={<CenteredLoader />}>
  //       <ThemeSettings />
  //     </Suspense>
  //     <Suspense fallback={<CenteredLoader />}>
  //       <Toast />
  //     </Suspense>
  //   </div>
  // );

  const Authpages = () => (
    <div className={data ? "header-collapse" : ""}>
      <Outlet />
      <Suspense fallback={<CenteredLoader />}>
        <ThemeSettings />
      </Suspense>
      {/* <Suspense fallback={<CenteredLoader />}>
        <Toast />
      </Suspense> */}
    </div>
  );

  return (
    <div>
      <Suspense fallback={<CenteredLoader />}>
        <Routes>
          {/* <Route
            path="/"
            element={
              <Suspense fallback={<CenteredLoader />}>
                <PrivateRoute>
                <HeaderLayout />
                </PrivateRoute>
              </Suspense>
            }
          >
            {publicRoutes.map((route: RouteConfig) => (
              <Route key={route.id} path={route.path} element={route.element} />
            ))}
          </Route> */}

          <Route path="/" element={<Authpages />}>
            {pagesRoute.map((route: RouteConfig) => (
              <Route key={route.id} path={route.path} element={route.element} />
            ))}
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
};

export default AllRoutes;
