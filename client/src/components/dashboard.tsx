import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, Tag, DollarSign, Plus, Download, TrendingUp, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AddItemModal from "@/components/modals/add-item-modal";
import { useToast } from "@/hooks/use-toast";

interface InventoryStats {
  totalItems: number;
  lowStock: number;
  categories: number;
  totalValue: number;
}

export default function Dashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: stats, isLoading } = useQuery<InventoryStats>({
    queryKey: ["/api/inventory-stats"],
  });

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your inventory export is being prepared and will download shortly.",
    });
  };

  const handleAnalytics = () => {
    toast({
      title: "Analytics",
      description: "Advanced analytics features coming soon.",
    });
  };

  const handleAlerts = () => {
    toast({
      title: "Alert Center",
      description: "Alert management features coming soon.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Items</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.totalItems || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Low Stock</p>
                <p className="text-2xl font-bold text-destructive">
                  {stats?.lowStock || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Categories</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.categories || 0}
                </p>
              </div>
              <Tag className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Value</p>
                <p className="text-2xl font-bold text-foreground">
                  ${stats?.totalValue?.toFixed(2) || "0.00"}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity to display</p>
                <p className="text-sm">Activity will appear here as you manage inventory</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-1 bg-primary/10 hover:bg-primary/20 border-primary/20"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-5 w-5" />
                <span className="text-sm font-medium">Add Item</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-1 bg-secondary/10 hover:bg-secondary/20 border-secondary/20"
                onClick={handleExport}
              >
                <Download className="h-5 w-5" />
                <span className="text-sm font-medium">Export</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-1 bg-accent/10 hover:bg-accent/20 border-accent/20"
                onClick={handleAnalytics}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">Analytics</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-16 flex flex-col space-y-1 bg-destructive/10 hover:bg-destructive/20 border-destructive/20"
                onClick={handleAlerts}
              >
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-medium">Alerts</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
