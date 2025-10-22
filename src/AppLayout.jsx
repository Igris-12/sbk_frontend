import React, { createContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import toast, { Toaster } from "react-hot-toast";
  import { useLocation } from "react-router-dom";
import { fetchDataFromApi } from "./utils/api";
export const MyContext = createContext();

export default function AppLayout() {
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  const handleSearch = (term) => setGlobalSearchTerm(term);

  const openAlertBox = (status, msg) => {
    if (status === "Success" || status === "success") toast.success(msg);
    else toast.error(msg);
  };

  // ✅ Login / token validation logic moved here
  useEffect(() => {
    const token = localStorage.getItem("accesstoken");
    if (token) {
      setIsLogin(true);
      fetchDataFromApi(`/api/user/user-details`)
        .then((res) => {
          setUserData(res.data);
          if (res?.response?.data?.error === true) {
            if (res?.response?.data?.message === "You have not login") {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              openAlertBox("error", "Your Session is Over !! Please Login again");
              setIsLogin(false);
            }
          }
        })
        .catch(() => setIsLogin(false));
    } else {
      setIsLogin(false);
    }
  }, [isLogin]);

  // ✅ All context values you want exported
  const contextValues = {
    openAlertBox,
    isLogin,
    setIsLogin,
    userData,
    setUserData,
    globalSearchTerm,
    setGlobalSearchTerm,
  };

const hideHeaderRoutes = ["/login", "/sign-up", "/forgot-password", "/verify-account"];

const location = useLocation();
const hideHeader = hideHeaderRoutes.includes(location.pathname);

return (
  <MyContext.Provider value={contextValues}>
    <div className="min-h-screen bg-space-dark text-text-light font-sans antialiased">
      {!hideHeader && <Header onSearch={handleSearch} />}
      <div className={`flex h-screen overflow-hidden ${!hideHeader ? "pt-16" : ""}`}>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
    <Toaster />
  </MyContext.Provider>
);

}
