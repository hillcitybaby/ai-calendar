"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { AssistantProvider } from "@/components/assistant/assistant-provider";
import { StoreProvider } from "@/lib/store";

import { Sidebar } from "./sidebar";
import { SidebarRail } from "./sidebar-rail";
import { TabBar } from "./tab-bar";
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
            <div className="flex min-w-0 flex-1 flex-col">
              <main className="flex min-h-0 flex-1 flex-col">{children}</main>
              <TabBar />
            </div>
          </div>
          <AssistantPanel />
        </AssistantProvider>
      </ShellProvider>
    </StoreProvider>
  );
}

/**
 * Desktop (1280+): expanded sidebar or icon rail, as the person chose.
 * Tablet (768–1279): always the icon rail; expand opens the full sidebar as an overlay drawer.
 * Mobile (under 768): no sidebar; the tab bar takes over.
 */
function ShellSidebar() {
  const { collapsed, drawerOpen, setDrawerOpen } = useShell();
  const pathname = usePathname();
  React.useEffect(() => setDrawerOpen(false), [pathname, setDrawerOpen]);
  // Esc closes the drawer wherever focus is.
  React.useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, setDrawerOpen]);
  return (
    <>
      <div className="hidden h-full md:flex xl:hidden">
        <SidebarRail initials={USER_INITIALS} />
      </div>
      <div className="hidden h-full xl:flex">
        {collapsed ? <SidebarRail initials={USER_INITIALS} /> : <Sidebar name={WORKSPACE_NAME} initials={USER_INITIALS} />}
      </div>
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex xl:hidden">
          <div className="h-full shadow-lg">
            <Sidebar name={WORKSPACE_NAME} initials={USER_INITIALS} />
          </div>
          <button
            type="button"
            aria-label="Close sidebar"
            className="flex-1 bg-black/20"
            onClick={() => setDrawerOpen(false)}
          />
        </div>
      )}
    </>
  );
}
