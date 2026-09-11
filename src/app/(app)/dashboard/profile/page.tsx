import { PageHeader } from "@/components/shared/page-header";
import { ProfileScreen } from "@/components/profile/profile-screen";

export const metadata = { title: "Profile · ClipTech" };

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profile" />
      <ProfileScreen />
    </>
  );
}
