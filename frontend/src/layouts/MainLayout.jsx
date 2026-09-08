import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar.jsx";
import Footer from "../components/footer/Footer.jsx";
import MobileTabBar from "../components/navbar/MobileTabBar.jsx";

const MainLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Outlet />
    </main>
    <Footer />
    <MobileTabBar />
  </div>
);

export default MainLayout;
