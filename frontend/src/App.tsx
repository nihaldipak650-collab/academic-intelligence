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
import { AppShell } from "./components/AppShell";
import { AdvisorDataProvider } from "./data/AdvisorDataContext";
import { AdvisorDetailPage } from "./pages/AdvisorDetailPage";
import { AdvisorListPage } from "./pages/AdvisorListPage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return null;
}

export default function App() {
  const reviewMode = import.meta.env.VITE_DATA_MODE === "review";

  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route index element={<PlatformHomePage />} />
        <Route path="baoyan/prototype-a" element={<BaoyanPrototypeAPage />} />
        <Route path="baoyan/prototype-b" element={<BaoyanPrototypeBPage />} />
        {reviewMode && (
          <Route
            element={
              <AdvisorDataProvider>
                <AppShell />
              </AdvisorDataProvider>
            }
          >
            <Route path="advisors" element={<AdvisorListPage />} />
            <Route path="advisor/:id" element={<AdvisorDetailPage />} />
          </Route>
        )}
        <Route path="*" element={<PlatformHomePage />} />
      </Routes>
    </HashRouter>
  );
}
