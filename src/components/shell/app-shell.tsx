"use client";

import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { AssistantProvider } from "@/components/assistant/assistant-provider";
import { StoreProvider } from "@/lib/store";

import { Sidebar } from "./sidebar";
import { SidebarRail } from "./sidebar-rail";
import { ShellProvider, useShell } from "./shell-provider";

/** Example identity until accounts exist. Keep generic: this repo is public. */
const WORKSPACE_NAME = "My Calendar";
const USER_INITIALS = "ME";

export function AppShell({
  defaultCollapsed,
  children,
}: {
  defaultCollapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <ShellProvider defaultCollapsed={defaultCollapsed}>
        <AssistantProvider>
          <div className="flex h-dvh overflow-hidden bg-background">
            <ShellSidebar />
            <main className="flex min-w-0 flex-1 flex-col">{children}</main>
          </div>
          <AssistantPanel />
        </AssistantProvider>
      </ShellProvider>
    </StoreProvider>
  );
}

function ShellSidebar() {
  const { collapsed } = useShell();
  return collapsed ? <SidebarRail initials={USER_INITIALS} /> : <Sidebar name={WORKSPACE_NAME} initials={USER_INITIALS} />;
}
