import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Cake, LayoutDashboard, Package, Users, BarChart3, LogOut, ShoppingCart, TrendingUp, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type Section = "dashboard" | "inventory" | "orders" | "analytics" | "categories" | "tasks" | "alerts" | "export" | "users" | "activity" | "reports";

interface SidebarProps {
  currentSection: Section;
  onSectionChange: (section: Section) => void;
  userRole: string;
}

export default function Sidebar({ currentSection, onSectionChange, userRole }: SidebarProps) {
  const { logoutMutation, user } = useAuth();

  const menuItems = [
    {
      id: "dashboard" as Section,
      label: "Dashboard",
      icon: LayoutDashboard,
      allowedRoles: ["admin", "staff"]
    },
    {
      id: "inventory" as Section,
      label: "Inventory",
      icon: Package,
      allowedRoles: ["admin", "staff"]
    },
    {
      id: "users" as Section,
      label: "Users",
      icon: Users,
      allowedRoles: ["admin"]
    },
    {
      id: "reports" as Section,
      label: "Reports",
      icon: BarChart3,
      allowedRoles: ["admin", "staff"]
    }
  ];

  const visibleItems = menuItems.filter(item => 
    item.allowedRoles.includes(userRole)
  );

  return (
    <div className="bg-sidebar w-64 min-h-screen shadow-custom flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <Cake className="h-8 w-8 text-sidebar-foreground" />
          <div>
            <h2 className="font-bold text-sidebar-foreground">Cheesecackery</h2>
            <p className="text-sidebar-foreground/70 text-sm capitalize">
              {user?.role || "User"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start space-x-3 h-12 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                  onClick={() => onSectionChange(item.id)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start space-x-3 h-12 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-5 w-5" />
          <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
        </Button>
      </div>
    </div>
  );
}
