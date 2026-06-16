import { useAuth } from "@/context/AuthProviderContext";
import { Button } from "@/components/ui/button";
import SideBar from "@/components/shared/SideBar";
import ModeToggle from "@/components/mode-toggle";
import OnboardingChecklist from "@/features/dashboard/OnboardingChecklist";

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
        />

        <main className="flex min-w-0 flex-1 flex-col gap-6 bg-background p-4 text-foreground md:p-6 lg:p-8">
          <ModeToggle />
          <section>
            <OnboardingChecklist />
          </section>
          <section className="flex flex-col gap-4 rounded-[28px] border border-border bg-card p-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Dashboard
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back, {auth.user?.firstName ?? "there"}.
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                {`Your email is ${auth.user?.email}. Your public ID is ${auth.user?.id}.`}
              </p>
            </div>

            <Button
              variant="ghost"
              onClick={() => auth.logout()}
              className="w-fit self-start rounded-full border border-border bg-background px-4 text-sm font-semibold shadow-none hover:bg-muted"
            >
              Logout
            </Button>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
