import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Loading from "../pages/Loading";
import ErrorPage from "../pages/errorPage";

import ProtectedRoute from "./ProtectedRoute";
import AuthRoute from "./AuthRoute";
import Dashboard from "../pages/user/Dashboard";
import LibraryDiseaseManager from "../components/layout/manager/LibraryDiseaseManager";
import ListAllDisease from "../components/layout/manager/ListAllDisease";
import LibraryManager from "../pages/manager/LibraryManager";
import DiseaseDetail from "../components/layout/manager/DiseaseDetail";
import CreateDisease from "../components/layout/manager/CreateDisease";
import DiseaseCategory from "../components/layout/manager/DiseaseCategory";

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
        path: "library-manager",
        element: (
          <Suspense fallback={<Loading />}>
            <LibraryManager />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="disease" replace />,
          },
          {
            path: "disease",
            element: (
              <Suspense fallback={<Loading />}>
                <LibraryDiseaseManager />
              </Suspense>
            ),
            children: [
              {
                index: true,
                element: <Navigate to="list-all" replace />,
              },
              {
                path: "list-all",
                element: (
                  <Suspense fallback={<Loading />}>
                    <ListAllDisease />
                  </Suspense>
                ),
                children: [
                  {
                    path: ":id",
                    element: (
                      <Suspense fallback={<Loading />}>
                        <DiseaseDetail />
                      </Suspense>
                    ),
                    errorElement: <ErrorPage />,
                  },
                ],
                errorElement: <ErrorPage />,
              },
              {
                path: "disease-categories",
                element: (
                  <Suspense fallback={<Loading />}>
                    <DiseaseCategory />
                  </Suspense>
                ),
                errorElement: <ErrorPage />,
              },
              {
                path: "add-disease",
                element: (
                  <Suspense fallback={<Loading />}>
                    <CreateDisease />
                  </Suspense>
                ),
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
