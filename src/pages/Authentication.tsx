import { useEffect } from "react";
import { useAuth } from "@/context/AuthProviderContext";

// Login and registration are handled by Keycloak; this page only forwards there
function Authentication() {
  const auth = useAuth();

  useEffect(() => {
    if (localStorage.getItem("activePage") === "register") {
      auth?.register();
    } else {
      auth?.login();
    }
  }, [auth]);

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-6">
      Redirecting...
    </div>
  );
}

export default Authentication;
