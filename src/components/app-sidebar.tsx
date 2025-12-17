import { Rocket, Box, Building, LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
const NavItem = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <SidebarMenuItem>
    <NavLink to={to} end className="w-full">
      {({ isActive }) => (
        <SidebarMenuButton
          className={cn(
            "w-full justify-start",
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          {children}
        </SidebarMenuButton>
      )}
    </NavLink>
  </SidebarMenuItem>
);
export function AppSidebar(): JSX.Element {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <Rocket className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">ReleaseRadar</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <NavItem to="/">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Mission Control</span>
          </NavItem>
          <NavItem to="/project/oss">
            <Box className="mr-2 h-4 w-4" />
            <span>Open Source</span>
          </NavItem>
          <NavItem to="/project/enterprise">
            <Building className="mr-2 h-4 w-4" />
            <span>Enterprise</span>
          </NavItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}