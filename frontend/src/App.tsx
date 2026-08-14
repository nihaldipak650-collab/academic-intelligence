import { useEffect } from "react";
import {
  HashRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { PlatformHomePage } from "./pages/PlatformHomePage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route index element={<PlatformHomePage />} />
        <Route path="*" element={<PlatformHomePage />} />
      </Routes>
    </HashRouter>
  );
}
