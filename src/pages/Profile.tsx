import SideBar from "@/components/shared/SideBar";
import NotAvailable from "./NotAvailable";

function Profile() {
  return (
    <div className="flex min-h-screen items-center bg-background text-foreground">
      <SideBar pageName="Profile" />
      <NotAvailable />
    </div>
  );
}

export default Profile;
