import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Loading from "../pages/Loading";
import ErrorPage from "../pages/errorPage";

import ProtectedRoute from "./ProtectedRoute";
import AuthRoute from "./AuthRoute";

import AllTopics from "../components/ui/topic/AllTopics";
import DetailActicle from "../components/ui/article/DetailActicle";
import TopicDetail from "../components/ui/topic/TopicDetail";
import ChatBot from "../components/layout/ai/ChatBot";
import BookExamination from "../components/layout/examination/BookExamination";
import BookExaminationDetail from "../components/layout/examination/BookExaminationDetail";
import AppointmentBookingForm from "../components/layout/examination/AppointmentBookingForm";
import HealthInfo from "../components/layout/user/HealthInfo";
import BMICalculator from "../components/ui/healthtool/BMICalculator";
import Tools from "../components/layout/tools/Tools";
import AllTools from "../components/ui/healthtool/AllTools";
import SleepCalculator from "../components/ui/healthtool/SleepCalculator";

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
        <Home />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/book-examination",
    element: (
      <Suspense fallback={<Loading />}>
        <ProtectedRoute>
          <BookExamination />
        </ProtectedRoute>
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/book-examination/info",
    element: (
      <Suspense fallback={<Loading />}>
        <ProtectedRoute>
          <BookExaminationDetail />
        </ProtectedRoute>
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/book-examination/confirm",
    element: (
      <Suspense fallback={<Loading />}>
        <ProtectedRoute>
          <AppointmentBookingForm />
        </ProtectedRoute>
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/vivanta-ai",
    element: (
      <Suspense fallback={<Loading />}>
        <ChatBot />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/topics",
    element: (
      <Suspense fallback={<Loading />}>
        <AllTopics />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/topic",
    element: (
      <Suspense fallback={<Loading />}>
        <TopicDetail />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/article",
    element: (
      <Suspense fallback={<Loading />}>
        <DetailActicle />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/tools",
    element: (
      <Suspense fallback={<Loading />}>
        <Tools />
      </Suspense>
    ),
    children: [
      {
        path: "all",
        element: (
          <Suspense fallback={<Loading />}>
            <AllTools />
          </Suspense>
        ),

        errorElement: <ErrorPage />,
      },
      {
        path: "bmi",
        element: (
          <Suspense fallback={<Loading />}>
            <BMICalculator />
          </Suspense>
        ),

        errorElement: <ErrorPage />,
      },
      {
        path: "sleep-caculator",
        element: (
          <Suspense fallback={<Loading />}>
            <SleepCalculator />
          </Suspense>
        ),

        errorElement: <ErrorPage />,
      },
    ],
    errorElement: <ErrorPage />,
  },
  {
    path: "account",
    element: (
      <Suspense fallback={<Loading />}>
        <ProtectedRoute>
          <Account />
        </ProtectedRoute>
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
        path: "health_info",
        element: (
          <Suspense fallback={<Loading />}>
            <HealthInfo />
          </Suspense>
        ),
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
]);

export default router;
