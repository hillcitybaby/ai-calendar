import { cookies } from "next/headers";

import { AppShell } from "@/components/shell/app-shell";
import { SIDEBAR_COOKIE } from "@/components/shell/constants";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const collapsed = (await cookies()).get(SIDEBAR_COOKIE)?.value === "true";
  return <AppShell defaultCollapsed={collapsed}>{children}</AppShell>;
}
