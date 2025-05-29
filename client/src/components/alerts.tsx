import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Bell, AlertTriangle, CheckCircle, X, Eye, EyeOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Alerts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [showDismissed, setShowDismissed] = useState(false);
  const { toast } = useToast();

  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts", searchQuery, typeFilter, severityFilter, showDismissed],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: number) => {
      await apiRequest("PATCH", `/api/alerts/${alertId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  const dismissAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      await apiRequest("PATCH", `/api/alerts/${alertId}/dismiss`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert dismissed",
        description: "Alert has been successfully dismissed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to dismiss alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      await apiRequest("DELETE", `/api/alerts/${alertId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert resolved",
        description: "Alert has been successfully resolved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to resolve alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "high":
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "low_stock":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "expiration":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "task_overdue":
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || alert.type === typeFilter;
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
    const matchesDismissed = showDismissed || !alert.isDismissed;
    return matchesSearch && matchesType && matchesSeverity && matchesDismissed;
  });

  const unreadCount = alerts.filter(a => !a.isRead && !a.isDismissed).length;
  const criticalCount = alerts.filter(a => a.severity === "critical" && !a.isDismissed).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {alerts.filter(a => !a.isDismissed).length}
              </div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {unreadCount}
              </div>
              <p className="text-sm text-muted-foreground">Unread</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {criticalCount}
              </div>
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {alerts.filter(a => a.isDismissed).length}
              </div>
              <p className="text-sm text-muted-foreground">Dismissed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="expiration">Expiration</SelectItem>
            <SelectItem value="task_overdue">Task Overdue</SelectItem>
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setShowDismissed(!showDismissed)}
          className="flex items-center gap-2"
        >
          {showDismissed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showDismissed ? "Hide Dismissed" : "Show Dismissed"}
        </Button>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
            <p className="text-muted-foreground">
              {searchQuery || typeFilter !== "all" || severityFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "All clear! No active alerts at the moment."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`hover:shadow-md transition-shadow ${
                !alert.isRead && !alert.isDismissed ? 'border-l-4 border-l-blue-500' : ''
              } ${alert.isDismissed ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeIcon(alert.type)}
                      <h3 className={`font-semibold text-lg ${!alert.isRead ? 'text-blue-700' : ''}`}>
                        {alert.title}
                      </h3>
                      {getSeverityBadge(alert.severity)}
                      {alert.isDismissed && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600">
                          Dismissed
                        </Badge>
                      )}
                      {!alert.isRead && !alert.isDismissed && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          New
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{alert.message}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created {new Date(alert.createdAt).toLocaleString()}</span>
                      {alert.entityType && (
                        <span>• Related to {alert.entityType.replace('_', ' ')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {!alert.isDismissed && (
                      <>
                        {!alert.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate(alert.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            Mark Read
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => dismissAlertMutation.mutate(alert.id)}
                          disabled={dismissAlertMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => resolveAlertMutation.mutate(alert.id)}
                          disabled={resolveAlertMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}