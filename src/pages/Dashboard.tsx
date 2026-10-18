import { useAuth } from "@/context/AuthProviderContext";
import SideBar from "@/components/shared/SideBar";
import DashboardOverview from "@/features/dashboard/DashboardOverview";

function Dashboard() {
  const auth = useAuth();

  if (!auth) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col lg:flex-row">
        <SideBar
          pageName="Dashboard"
          userName={
            `${auth.user?.firstName ?? ""} ${auth.user?.lastName ?? ""}`.trim() ||
            "shadcn"
          }
          email={auth.user?.email ?? "m@example.com"}
          avatarUrl="/preparo_sprites/happy-checklist-preparo.png"
          showPlan
        />

        <main className="flex min-h-screen min-w-0 flex-1 flex-col bg-background text-foreground">
          {/* Users without onboarding never reach here; ProtectedRoutes sends them to /onboarding */}
          <DashboardOverview firstName={auth.user?.firstName} />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
