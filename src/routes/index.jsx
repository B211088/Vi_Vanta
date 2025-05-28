import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Loading from "../pages/Loading";
import ErrorPage from "../pages/errorPage";

import ProtectedRoute from "./ProtectedRoute";
import AuthRoute from "./AuthRoute";
import BodyIndex from "../components/layout/user/BodyIndex";
import Tools from "../pages/user/Tools";
import Dashboard from "../pages/user/Dashboard";
import BmiCalculateForm from "../components/common/forms/BmiCalculateForm";
import BmiCalculateDetail from "../components/ui/BmiCalculateDetail";
import EmmCalculateForm from "../components/common/forms/EmmCalculateForm";
import EmmCalculateDetail from "../components/ui/EmmCalculateDetail";
import BodyFatCalculateForm from "../components/common/forms/BodyFatCalculateForm";
import WhrCalculateForm from "../components/common/forms/WhrCalculateForm";
import WhrCalculateDetail from "../components/ui/WhrCalculateDetail";
import BodyFatCalculateDetail from "../components/ui/BodyFatCalculateDetail";

const Home = lazy(() => import("../pages/user/Home"));
const Auth = lazy(() => import("../pages/auth/Auth"));
const Profile = lazy(() => import("../components/layout/user/Profile"));
const Account = lazy(() => import("../pages/user/Account"));
const ConfirmAccount = lazy(() => import("../pages/auth/ConfirmAccount"));
const ConfirmCodeForm = lazy(() =>
  import("../components/common/forms/ConfirmCodeForm")
);
const SendCodeForm = lazy(() =>
  import("../components/common/forms/SendCodeForm")
);
const RegisterForm = lazy(() =>
  import("../components/common/forms/RegisterForm")
);
const LoginForm = lazy(() => import("../components/common/forms/LoginForm"));

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
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<Loading />}>
            <Dashboard />
          </Suspense>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "account",
        element: (
          <Suspense fallback={<Loading />}>
            <Account />
          </Suspense>
        ),
        children: [
          {
            path: "profile",
            element: (
              <Suspense fallback={<Loading />}>
                <Profile />
              </Suspense>
            ),
            errorElement: <ErrorPage />,
          },
          {
            path: "social_info",
            element: (
              <Suspense fallback={<Loading />}>
                <Profile />
              </Suspense>
            ),
            errorElement: <ErrorPage />,
          },
        ],
        errorElement: <ErrorPage />,
      },
      {
        path: "tools",
        element: (
          <Suspense fallback={<Loading />}>
            <Tools />
          </Suspense>
        ),
        children: [
          {
            index: true, // 👉 khi người dùng truy cập /tools
            element: <Navigate to="body-index" replace />,
          },
          {
            path: "body-index",
            element: (
              <Suspense fallback={<Loading />}>
                <BodyIndex />
              </Suspense>
            ),
            children: [
              {
                index: true,
                element: <Navigate to="calculate-bmi" replace />,
              },
              {
                path: "calculate-bmi",
                element: (
                  <Suspense fallback={<Loading />}>
                    <BmiCalculateForm />
                  </Suspense>
                ),
                children: [
                  {
                    path: ":id",
                    element: (
                      <Suspense fallback={<Loading />}>
                        <BmiCalculateDetail />
                      </Suspense>
                    ),
                  },
                ],
              },
              {
                path: "calculate-emm",
                element: (
                  <Suspense fallback={<Loading />}>
                    <EmmCalculateForm />
                  </Suspense>
                ),
                children: [
                  { path: ":id", element: <EmmCalculateDetail /> }, // nếu có component chi tiết
                ],
              },
              {
                path: "calculate-body-fat",
                element: (
                  <Suspense fallback={<Loading />}>
                    <BodyFatCalculateForm />
                  </Suspense>
                ),
                children: [
                  {
                    path: ":id",
                    element: (
                      <Suspense fallback={<Loading />}>
                        <BodyFatCalculateDetail />
                      </Suspense>
                    ),
                  },
                ],
              },
              {
                path: "calculate-whr",
                element: (
                  <Suspense fallback={<Loading />}>
                    <WhrCalculateForm />
                  </Suspense>
                ),
                children: [
                  {
                    path: ":id",
                    element: (
                      <Suspense fallback={<Loading />}>
                        <WhrCalculateDetail />
                      </Suspense>
                    ),
                  },
                ],
              },
            ],
            errorElement: <ErrorPage />,
          },
        ],
        errorElement: <ErrorPage />,
      },
    ],
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
  {
    path: "/account",
    element: (
      <Suspense fallback={<Loading />}>
        <Account />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
]);

export default router;
