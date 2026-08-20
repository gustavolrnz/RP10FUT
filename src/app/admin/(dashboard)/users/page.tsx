import { auth } from "@/auth";
import { listStaff } from "@/lib/data/settings";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  const session = await auth();
  const staff = await listStaff();
  return <UsersClient staff={staff} currentEmail={session!.user.email!} />;
}
