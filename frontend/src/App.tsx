import { useEffect } from "react";
import {
  HashRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { PlatformHomePage } from "./pages/PlatformHomePage";
import { BaoyanPrototypeAPage } from "./pages/BaoyanPrototypeAPage";
import { BaoyanPrototypeBPage } from "./pages/BaoyanPrototypeBPage";

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
        <Route path="baoyan/prototype-a" element={<BaoyanPrototypeAPage />} />
        <Route path="baoyan/prototype-b" element={<BaoyanPrototypeBPage />} />
        <Route path="*" element={<PlatformHomePage />} />
      </Routes>
    </HashRouter>
  );
}
