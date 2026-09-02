import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PlatformFlagship } from "../components/platform/PlatformFlagship";
import { PlatformFooter } from "../components/platform/PlatformFooter";
import { PlatformGrowthNavigator } from "../components/platform/PlatformGrowthNavigator";
import { PlatformGrowthPath } from "../components/platform/PlatformGrowthPath";
import { PlatformHeader } from "../components/platform/PlatformHeader";
import { PlatformHero } from "../components/platform/PlatformHero";
import { PlatformRealityProbe } from "../components/platform/PlatformRealityProbe";
import { PlatformServices } from "../components/platform/PlatformServices";
import { PlatformToastProvider } from "../components/platform/PlatformToast";
import { PlatformUpdateNotice } from "../components/platform/PlatformUpdateNotice";
import { scrollToPlatformSection } from "../lib/platformNav";
import "../styles/platform-home.css";

export function PlatformHomePage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!scrollTo) return;

    requestAnimationFrame(() => {
      scrollToPlatformSection(scrollTo);
    });
    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  return (
    <div className="platform-home">
      <PlatformToastProvider>
        <PlatformUpdateNotice />
        <PlatformHeader />
        <PlatformHero />
        <main className="shell">
          <PlatformFlagship />
          <PlatformGrowthPath />
          <PlatformGrowthNavigator />
          <PlatformServices />
          <PlatformRealityProbe />
        </main>
        <PlatformFooter />
      </PlatformToastProvider>
    </div>
  );
}
