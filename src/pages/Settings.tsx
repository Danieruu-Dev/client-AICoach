import { useAuth } from "@/context/AuthProviderContext";
import SideBar from "@/components/shared/SideBar";
import SettingsOverview from "@/features/settings/SettingsOverview";

function Settings() {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col lg:flex-row">
        <SideBar
          pageName="Settings"
          userName={`${auth?.user?.firstName ?? ""} ${auth?.user?.lastName ?? ""}`.trim()}
          email={auth?.user?.email}
        />

        <main className="flex min-h-screen min-w-0 flex-1 flex-col bg-background text-foreground">
          <SettingsOverview />
        </main>
      </div>
    </div>
  );
}

export default Settings;
