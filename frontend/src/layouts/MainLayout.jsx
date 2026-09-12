import { Outlet } from "react-router-dom";

import Navbar from "../components/navbar/Navbar.jsx";
import Footer from "../components/footer/Footer.jsx";
import MobileTabBar from "../components/navbar/MobileTabBar.jsx";

const MainLayout = () => {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Page Content */}

      <main
        className="
          flex-1
          pt-16
          pb-[calc(3.5rem+env(safe-area-inset-bottom))]
          md:pb-0
        "
      >
        <Outlet />
      </main>

      {/* Footer */}

      <Footer />

      {/* Mobile Bottom Navigation */}

      <MobileTabBar />
    </div>
  );
};

export default MainLayout;
