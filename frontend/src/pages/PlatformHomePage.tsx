import { PlatformFlagship } from "../components/platform/PlatformFlagship";
import { PlatformFooter } from "../components/platform/PlatformFooter";
import { PlatformGrowthPath } from "../components/platform/PlatformGrowthPath";
import { PlatformHeader } from "../components/platform/PlatformHeader";
import { PlatformHero } from "../components/platform/PlatformHero";
import { PlatformRealityProbe } from "../components/platform/PlatformRealityProbe";
import { PlatformServices } from "../components/platform/PlatformServices";
import { PlatformToastProvider } from "../components/platform/PlatformToast";
import "../styles/platform-home.css";

export function PlatformHomePage() {
  return (
    <div className="platform-home">
      <PlatformToastProvider>
        <PlatformHeader />
        <PlatformHero />
        <main className="shell">
          <PlatformFlagship />
          <PlatformGrowthPath />
          <PlatformServices />
          <PlatformRealityProbe />
        </main>
        <PlatformFooter />
      </PlatformToastProvider>
    </div>
  );
}
