import { useAuth } from "@/context/AuthProviderContext";
import { Button } from "@/components/ui/button";

function Dashboard() {
  const auth = useAuth();

  if (!auth) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        {`Welcome to the Dashboard, ${auth.user?.firstName} ${auth.user?.lastName}! Your email is ${auth.user?.email}. Your public ID is ${auth.user?.id}.`}
      </div>
      <div>
        <Button variant="ghost" onClick={() => auth.logout()}>
          Logout
        </Button>
      </div>
    </div>
  );
}

export default Dashboard;
