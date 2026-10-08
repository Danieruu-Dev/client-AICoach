import { useAuth } from "@/context/AuthProviderContext";
import SideBar from "@/components/shared/SideBar";
import OnboardingChecklist from "@/features/dashboard/OnboardingChecklist";
import DashboardOverview from "@/features/dashboard/DashboardOverview";

function Dashboard() {
  const auth = useAuth();
  console.log(auth?.user?.onboardingCompleted);

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
          {!auth.user?.onboardingCompleted ? (
            <div className="p-4 pt-20 md:p-6 lg:p-8 lg:pt-8">
              <OnboardingChecklist />
            </div>
          ) : (
            <DashboardOverview firstName={auth.user?.firstName} />
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
