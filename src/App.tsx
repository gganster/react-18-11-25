import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";
import useAuthStore from "./stores/auth";
import SuspenseFallback from "./components/SuspenseFallback";
import useAutoLogin from "./hooks/useAutoLogin";

import DashboardLayout from "./layouts/Dashboard";

//import Login from "./pages/Login";
//import Register from "./pages/Register";
//import DashboardHome from "./pages/Dashboard/DashboardHome";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const DashboardHome = lazy(() => import("./pages/Dashboard/DashboardHome"));

function App() {
  const { user, loading } = useAuthStore();
  useAutoLogin();

  if (loading) return <SuspenseFallback />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {user ?
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
          </Route>
        : <Route path="/dashboard" element={<Navigate to="/login" />} />}

        <Route path="*" element={<span>404</span>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;