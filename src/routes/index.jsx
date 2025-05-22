import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import Loading from "../pages/Loading";
import ErrorPage from "../pages/errorPage";
import LoginForm from "../components/common/LoginForm";
import RegisterForm from "../components/common/RegisterForm";
import ProtectedRoute from "./ProtectedRoute";
import AuthRoute from "./AuthRoute";
import ConfirmAccount from "../pages/ConfirmAccount";
import SendCodeForm from "../components/common/SendCodeForm";
import ConfirmCodeForm from "../components/common/ConfirmCodeForm";

const Home = lazy(() => import("../pages/Home"));
const Auth = lazy(() => import("../pages/Auth"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<Loading />}>
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/auth",
    element: (
      <Suspense fallback={<Loading />}>
        <AuthRoute>
          <Auth />
        </AuthRoute>
      </Suspense>
    ),
    children: [
      {
        path: "login",
        element: (
          <Suspense fallback={<Loading />}>
            <LoginForm />
          </Suspense>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "register",
        element: (
          <Suspense fallback={<Loading />}>
            <RegisterForm />
          </Suspense>
        ),
        errorElement: <ErrorPage />,
      },
    ],
    errorElement: <ErrorPage />,
  },
  {
    path: "/confirm_account",
    element: (
      <Suspense>
        <AuthRoute>
          <ConfirmAccount />
        </AuthRoute>
      </Suspense>
    ),
    children: [
      {
        path: "send_code",
        element: (
          <Suspense fallback={<Loading />}>
            <SendCodeForm />
          </Suspense>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "confirm_code",
        element: (
          <Suspense fallback={<Loading />}>
            <ConfirmCodeForm />
          </Suspense>
        ),
        errorElement: <ErrorPage />,
      },
    ],
    errorElement: <ErrorPage />,
  },
]);

export default router;
