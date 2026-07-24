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
          <Route element={<AppShell />}>
            <Route index element={<AdvisorListPage />} />
            <Route path="advisor/:id" element={<AdvisorDetailPage />} />
            <Route path="*" element={<AdvisorListPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AdvisorDataProvider>
  );
}

