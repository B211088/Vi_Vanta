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
import HeartRateMonitor from "../components/ui/healthtool/HeartRateMonitor";
import BodyFatAnalyzer from "../components/ui/healthtool/BodyFatAnalyzer";
import WaterIntakeCalculator from "../components/ui/healthtool/WaterIntakeCalculator";
import VaccineTracker from "../components/ui/healthtool/VaccineTracker";
import PregnancyCalculator from "../components/ui/healthtool/PregnancyCalculator";
import StressAssessmentApp from "../components/ui/healthtool/StressAssessmentApp";
import DiabetesRiskCalculator from "../components/ui/healthtool/DiabetesRiskCalculator";
import SleepQualityAssessment from "../components/ui/healthtool/SleepQualityAssessment";
import HealthProfileSetup from "../pages/user/HealthProfileSetup";
import Doctor from "../components/layout/doctor/Doctor";
import BookingManager from "../components/layout/doctor/BookingManager";
import ServicesManager from "../components/layout/doctor/ServicesManager";
import TimeSlot from "../components/ui/doctor/WorkingHour";
import WorkingHour from "../components/ui/doctor/WorkingHour";
import Appointment from "../pages/user/Appointment";

import AppointmentPayment from "../components/layout/examination/AppointmentPayment";
import PaymentReturn from "../components/layout/examination/PaymentReturn";
import BookingServices from "../components/ui/doctor/BookingServices";
import BookingSuccess from "../components/layout/examination/BookingSuccess";
import DoctorProtectedRoute from "./DoctorProtectedRoute";
import DoctorRegistration from "../components/ui/doctor/DoctorRegistration";
import SearchPage from "../pages/SearchPage";

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
        <BookExamination />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/book-examination/info",
    element: (
      <Suspense fallback={<Loading />}>
        <BookExaminationDetail />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/book-examination/confirm",
    element: (
      <Suspense fallback={<Loading />}>
        <AppointmentBookingForm />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/appointment-payment",
    element: (
      <Suspense fallback={<Loading />}>
        <AppointmentPayment />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/booking-appointment-success",
    element: (
      <Suspense fallback={<Loading />}>
        <BookingSuccess />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/payment/vnpay-return",
    element: (
      <Suspense fallback={<Loading />}>
        <PaymentReturn />
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
    path: "/search",
    element: (
      <Suspense fallback={<Loading />}>
        <SearchPage />
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
          <ProtectedRoute>
            <Suspense fallback={<Loading />}>
              <BMICalculator />
            </Suspense>
          </ProtectedRoute>
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
      {
        path: "heart-rate",
        element: (
          <Suspense fallback={<Loading />}>
            <HeartRateMonitor />
          </Suspense>
        ),

        errorElement: <ErrorPage />,
      },
      {
        path: "body-fat",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<Loading />}>
              <BodyFatAnalyzer />
            </Suspense>
          </ProtectedRoute>
        ),

        errorElement: <ErrorPage />,
      },
      {
        path: "water-intake",
        element: (
          <Suspense fallback={<Loading />}>
            <WaterIntakeCalculator />
          </Suspense>
        ),

        errorElement: <ErrorPage />,
      },
      {
        path: "due-date",
        element: (
          <Suspense fallback={<Loading />}>
            <PregnancyCalculator />
          </Suspense>
        ),

        errorElement: <ErrorPage />,
      },
      {
        path: "stress",
        element: (
          <Suspense fallback={<Loading />}>
            <StressAssessmentApp />
          </Suspense>
        ),

        errorElement: <ErrorPage />,
      },
      {
        path: "diabetes-risk",
        element: (
          <Suspense fallback={<Loading />}>
            <DiabetesRiskCalculator />
          </Suspense>
        ),

        errorElement: <ErrorPage />,
      },
      {
        path: "sleep-quality",
        element: (
          <Suspense fallback={<Loading />}>
            <SleepQualityAssessment />
          </Suspense>
        ),

        errorElement: <ErrorPage />,
      },
      {
        path: "vaccine",
        element: (
          <Suspense fallback={<Loading />}>
            <ProtectedRoute>
              <VaccineTracker />
            </ProtectedRoute>
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
      {
        path: "appointment",
        element: (
          <Suspense fallback={<Loading />}>
            <Appointment />
          </Suspense>
        ),
        errorElement: <ErrorPage />,
      },
    ],
    errorElement: <ErrorPage />,
  },
  {
    path: "health_setup",
    element: (
      <Suspense fallback={<Loading />}>
        <HealthProfileSetup />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "register-doctor",
    element: (
      <Suspense fallback={<Loading />}>
        <DoctorRegistration />
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
  {
    path: "doctor",
    element: (
      <Suspense fallback={<Loading />}>
        <Doctor />
      </Suspense>
    ),
    children: [
      {
        path: "booking",
        element: (
          <Suspense fallback={<Loading />}>
            <DoctorProtectedRoute>
              <BookingManager />
            </DoctorProtectedRoute>
          </Suspense>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "services",
        element: (
          <Suspense fallback={<Loading />}>
            <DoctorProtectedRoute>
              <ServicesManager />
            </DoctorProtectedRoute>
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="time-slot" replace />,
          },
          {
            path: "working-hour",
            element: (
              <Suspense fallback={<Loading />}>
                <DoctorProtectedRoute>
                  <WorkingHour />
                </DoctorProtectedRoute>
              </Suspense>
            ),
            errorElement: <ErrorPage />,
          },
          {
            path: "booking-services",
            element: (
              <Suspense fallback={<Loading />}>
                <DoctorProtectedRoute>
                  <BookingServices />
                </DoctorProtectedRoute>
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
]);

export default router;
