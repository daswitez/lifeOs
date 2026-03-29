import { getSidebarData } from "@/server/queries/lifeos";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export function Sidebar() {
  return <SidebarContent />;
}

async function SidebarContent() {
  const { inboxCount } = await getSidebarData();
  return <SidebarNav inboxCount={inboxCount} />;
}
