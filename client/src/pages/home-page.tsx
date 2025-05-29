import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Dashboard from "@/components/dashboard";
import Inventory from "@/components/inventory";
import Orders from "@/components/orders";
import Analytics from "@/components/analytics";
import Categories from "@/components/categories";
import Tasks from "@/components/tasks";
import Alerts from "@/components/alerts";
import DataExport from "@/components/data-export";
import Users from "@/components/users";
import ActivityLogComponent from "@/components/activity-log";
import Reports from "@/components/reports";

type Section = "dashboard" | "inventory" | "orders" | "analytics" | "categories" | "tasks" | "alerts" | "export" | "users" | "activity" | "reports";

export default function HomePage() {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState<Section>("inventory");
  const [searchQuery, setSearchQuery] = useState("");

  const renderSection = () => {
    switch (currentSection) {
      case "dashboard":
        return <Dashboard />;
      case "inventory":
        return <Inventory searchQuery={searchQuery} />;
      case "orders":
        return <Orders />;
      case "analytics":
        return <Analytics />;
      case "categories":
        return <Categories />;
      case "tasks":
        return <Tasks />;
      case "alerts":
        return <Alerts />;
      case "export":
        return <DataExport />;
      case "users":
        return <Users />;
      case "activity":
        return <ActivityLogComponent />;
      case "reports":
        return <Reports />;
      default:
        return <Inventory searchQuery={searchQuery} />;
    }
  };

  const getSectionInfo = () => {
    switch (currentSection) {
      case "dashboard":
        return {
          title: "Dashboard",
          description: "Overview of your inventory system"
        };
      case "inventory":
        return {
          title: "Inventory Management",
          description: "Manage your cheesecake inventory"
        };
      case "orders":
        return {
          title: "Order Management",
          description: "Track and manage customer orders"
        };
      case "analytics":
        return {
          title: "Analytics & Insights",
          description: "Sales trends and performance metrics"
        };
      case "categories":
        return {
          title: "Category Management",
          description: "Organize inventory items by categories"
        };
      case "tasks":
        return {
          title: "Task Management",
          description: "Assign and track staff tasks"
        };
      case "alerts":
        return {
          title: "Alert Management",
          description: "Monitor system alerts and notifications"
        };
      case "export":
        return {
          title: "Data Export",
          description: "Export inventory and order data"
        };
      case "users":
        return {
          title: "User Management",
          description: "Manage system users and permissions"
        };
      case "activity":
        return {
          title: "Activity Log",
          description: "Track user actions and system changes"
        };
      case "reports":
        return {
          title: "Reports & Analytics",
          description: "View inventory analytics and reports"
        };
      default:
        return {
          title: "Inventory Management",
          description: "Manage your cheesecake inventory"
        };
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        userRole={user.role}
      />
      
      <div className="flex-1 flex flex-col">
        <Header
          sectionInfo={getSectionInfo()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
        />
        
        <main className="flex-1 p-6">
          <div className="fade-in">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
