import { HashRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AdvisorDataProvider } from "./data/AdvisorDataContext";
import { AdvisorDetailPage } from "./pages/AdvisorDetailPage";
import { AdvisorListPage } from "./pages/AdvisorListPage";

export default function App() {
  return (
    <AdvisorDataProvider>
      <HashRouter>
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

