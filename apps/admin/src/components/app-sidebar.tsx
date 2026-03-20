import * as React from "react"
import { authClient } from "@/lib/auth-client"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { 
  GalleryVerticalEndIcon, 
  LayoutDashboardIcon,
} from "lucide-react"

const sidebarData = {
  teams: [
    {
      name: "Reviewskits",
      logo: <GalleryVerticalEndIcon />,
      plan: "Enterprise",
    }
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: <LayoutDashboardIcon />,
      isActive: true,
    },
  ],
}

import { NavOrganizations } from "@/components/nav-organizations"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession()

  const userForSidebar = session ? {
    name: session.user.name,
    email: session.user.email,
    avatar: session.user.image || undefined,
  } : {
    name: "Guest",
    email: "",
    avatar: undefined,
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-900 bg-zinc-950/80 backdrop-blur-xl overflow-hidden" {...props}>
      {/* Top Glow Overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent)]" />
      
      <SidebarHeader className="relative z-10 border-b border-zinc-900/50 py-4 bg-transparent">
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      
      <SidebarContent className="relative z-10 bg-transparent custom-scrollbar">
        <NavMain items={sidebarData.navMain} />
        <NavOrganizations />
      </SidebarContent>

      <SidebarFooter className="relative z-10 border-t border-zinc-900/50 bg-transparent py-4">
        <NavUser user={userForSidebar} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
