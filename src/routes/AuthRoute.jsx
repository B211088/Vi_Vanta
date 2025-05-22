import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Loading from "../pages/Loading";

const AuthRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const from = location.state?.from?.pathname || "/";

  if (loading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return children;
};

export default AuthRoute;
