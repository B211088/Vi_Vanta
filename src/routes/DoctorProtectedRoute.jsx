import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Loading from "../pages/Loading";

const DoctorProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  if (loading) {
    return <Loading />;
  }

  // Nếu chưa đăng nhập, redirect về login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Kiểm tra xem user có role doctor không
  const hasDockerRole = user && user.roles && user.roles.includes("doctor");

  if (!hasDockerRole) {
    // Redirect về trang không có quyền truy cập
    return <Navigate to="/" replace />;
  }

  // Nếu có đủ quyền, hiển thị component con
  return children;
};

export default DoctorProtectedRoute;
