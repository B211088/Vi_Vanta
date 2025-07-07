import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Loading from "../pages/Loading";
import ErrorPage from "../pages/errorPage";

import ProtectedRoute from "./ProtectedRoute";
import AuthRoute from "./AuthRoute";
import Dashboard from "../pages/Dashboard";

import LibraryManager from "../pages/manager/LibraryManager";

import UserManager from "../components/layout/manager/users/UserManager";

import AIManager from "../pages/manager/AIManager";
import DataManager from "../components/layout/manager/ai/DataManager";
import Collection from "../components/layout/manager/ai/Collection";
import DataCollection from "../components/layout/manager/ai/DataCollection";
import DetailCollection from "../components/layout/manager/ai/DetailCollection";
import TestChatBot from "../components/ui/TestChatBot";
import DataCleaningFlow from "../components/modals/ai/DataCleaningFlow";
import ArticleManager from "../pages/manager/ArticleManager";
import ListAllTopics from "../components/ui/topic/ListAllTopics";
import TopicDetail from "../components/ui/topic/TopicDetail";
import Topics from "../components/layout/manager/article/Topics";
import Articles from "../components/layout/manager/article/Articles";
import ListAllArticle from "../components/ui/article/ListAllArticle";
import ArticleDetail from "../components/ui/article/ArticleDetail";
import CreateArticle from "../components/ui/article/CreateArticle";

const Home = lazy(() => import("../pages/Home"));
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

        errorElement: <ErrorPage />,
      },
      {
        path: "article-manager",
        element: (
          <Suspense fallback={<Loading />}>
            <ArticleManager />
          </Suspense>
        ),
        children: [
          {
            path: "articles",
            element: (
              <Suspense fallback={<Loading />}>
                <Articles />
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
                    <ListAllArticle />
                  </Suspense>
                ),
                children: [],
                errorElement: <ErrorPage />,
              },
              {
                path: "detail",
                element: (
                  <Suspense fallback={<Loading />}>
                    <ArticleDetail />
                  </Suspense>
                ),
                errorElement: <ErrorPage />,
              },
              {
                path: "create",
                element: (
                  <Suspense fallback={<Loading />}>
                    <CreateArticle />
                  </Suspense>
                ),
                errorElement: <ErrorPage />,
              },
            ],
            errorElement: <ErrorPage />,
          },
          {
            path: "topics",
            element: (
              <Suspense fallback={<Loading />}>
                <Topics />
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
                    <ListAllTopics />
                  </Suspense>
                ),
                errorElement: <ErrorPage />,
              },
              {
                path: "detail",
                element: (
                  <Suspense fallback={<Loading />}>
                    <TopicDetail />
                  </Suspense>
                ),
                errorElement: <ErrorPage />,
              },
            ],
            errorElement: <ErrorPage />,
          },
        ],
        errorElement: <ErrorPage />,
      },
      {
        path: "ai-manager",
        element: (
          <Suspense fallback={<Loading />}>
            <AIManager />
          </Suspense>
        ),
        children: [
          {
            path: "data",
            element: (
              <Suspense fallback={<Loading />}>
                <DataManager />
              </Suspense>
            ),
            children: [],
            errorElement: <ErrorPage />,
          },
          {
            path: "collection",
            element: (
              <Suspense fallback={<Loading />}>
                <Collection />
              </Suspense>
            ),
            children: [
              {
                path: "data",
                element: (
                  <Suspense fallback={<Loading />}>
                    <DataCollection />
                  </Suspense>
                ),
                children: [],
                errorElement: <ErrorPage />,
              },
              {
                path: "detail",
                element: (
                  <Suspense fallback={<Loading />}>
                    <DetailCollection />
                  </Suspense>
                ),
                children: [],
                errorElement: <ErrorPage />,
              },
            ],
            errorElement: <ErrorPage />,
          },
          {
            path: "testing",
            element: (
              <Suspense fallback={<Loading />}>
                <TestChatBot />
              </Suspense>
            ),
            children: [],
            errorElement: <ErrorPage />,
          },
          {
            path: "cleaning",
            element: (
              <Suspense fallback={<Loading />}>
                <DataCleaningFlow />
              </Suspense>
            ),
            children: [],
            errorElement: <ErrorPage />,
          },
        ],
        errorElement: <ErrorPage />,
      },
      {
        path: "users-manager",
        element: (
          <Suspense fallback={<Loading />}>
            <UserManager />
          </Suspense>
        ),
        children: [],
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
