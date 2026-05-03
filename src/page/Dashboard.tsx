import { useAuth } from "@/context/AuthProviderContext";
import React from "react";

function Dashboard() {
  const auth = useAuth();

  if (!auth) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {`Welcome to the Dashboard, ${auth.user?.firstName} ${auth.user?.lastName}! Your email is ${auth.user?.email}. Your public ID is ${auth.user?.id}.`}
    </div>
  );
}

export default Dashboard;
