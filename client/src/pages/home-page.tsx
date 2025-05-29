import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Dashboard from "@/components/dashboard";
import Inventory from "@/components/inventory";
import Users from "@/components/users";
import Reports from "@/components/reports";

type Section = "dashboard" | "inventory" | "users" | "reports";

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
      case "users":
        return <Users />;
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
      case "users":
        return {
          title: "User Management",
          description: "Manage system users and permissions"
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
