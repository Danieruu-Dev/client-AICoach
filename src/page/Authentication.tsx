import Login from "@/features/authentication/Login";
import Register from "@/features/authentication/Register";
import React from "react";

function Authentication() {
  const [isActive, setIsActive] = React.useState<"login" | "register">(
    localStorage.getItem("activePage") === "register" ? "register" : "login",
  );

  const handleActivePageChange = (active: "login" | "register") => {
    localStorage.setItem("activePage", active);
    setIsActive(active);
  };

  return (
    <>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          {isActive === "login" ? (
            <Login handleActivePageChange={handleActivePageChange} />
          ) : (
            <Register handleActivePageChange={handleActivePageChange} />
          )}
        </div>
      </div>
    </>
  );
}

export default Authentication;
