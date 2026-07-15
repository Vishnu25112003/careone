import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout";
import ScrollManager from "./components/layout/ScrollManager";
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Services from "./pages/public/Services";
import Gallery from "./pages/public/Gallery";
import Contact from "./pages/public/Contact";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Requests from "./pages/admin/Requests";
import Callbacks from "./pages/admin/Callbacks";
import GalleryManager from "./pages/admin/GalleryManager";
import { isAuthed } from "./lib/auth";

function ProtectedRoute({ children }) {
  const location = useLocation();
  if (!isAuthed()) return <Navigate to="/admin/login" replace state={{ from: location }} />;
  return children;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="requests" element={<Requests />} />
          <Route path="callbacks" element={<Callbacks />} />
          <Route path="gallery" element={<GalleryManager />} />
        </Route>
      </Routes>
    </>
  );
}
