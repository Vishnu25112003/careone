import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import CallbackBand from "./CallbackBand";
import Footer from "./Footer";
import Loader from "../ui/Loader";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Loader />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <CallbackBand />
      <Footer />
    </div>
  );
}
