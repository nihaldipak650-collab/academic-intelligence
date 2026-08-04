import { useEffect } from "react";
import {
  HashRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AdvisorDataProvider } from "./data/AdvisorDataContext";
import { AdvisorDetailPage } from "./pages/AdvisorDetailPage";
import { AdvisorListPage } from "./pages/AdvisorListPage";
import { PlatformHomePage } from "./pages/PlatformHomePage";
import { UpdatesPage } from "./pages/UpdatesPage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AdvisorDataProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route index element={<PlatformHomePage />} />
          <Route path="updates" element={<UpdatesPage />} />
          <Route element={<AppShell />}>
            <Route path="advisors" element={<AdvisorListPage />} />
            <Route path="advisor/:id" element={<AdvisorDetailPage />} />
          </Route>
          <Route path="*" element={<PlatformHomePage />} />
        </Routes>
      </HashRouter>
    </AdvisorDataProvider>
  );
}
