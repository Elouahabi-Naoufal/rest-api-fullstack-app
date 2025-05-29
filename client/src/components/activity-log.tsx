import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, User, Package, ShoppingCart, LogIn, LogOut, Edit, Trash2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityLog } from "@shared/schema";

interface ActivityLogWithUser extends ActivityLog {
  user: {
    username: string;
    email: string;
    role: string;
  };
}

export default function ActivityLogComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");

  const { data: logs = [], isLoading } = useQuery<ActivityLogWithUser[]>({
    queryKey: ["/api/activity-logs", searchQuery, actionFilter, userFilter],
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "login":
        return <LogIn className="h-4 w-4 text-green-600" />;
      case "logout":
        return <LogOut className="h-4 w-4 text-gray-600" />;
      case "create_item":
      case "create_user":
      case "create_order":
        return <Plus className="h-4 w-4 text-blue-600" />;
      case "update_item":
      case "update_user":
      case "update_order":
        return <Edit className="h-4 w-4 text-orange-600" />;
      case "delete_item":
      case "delete_user":
      case "delete_order":
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadge = (action: string) => {
    const actionMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      login: { label: "Login", variant: "outline" },
      logout: { label: "Logout", variant: "secondary" },
      create_item: { label: "Created Item", variant: "default" },
      update_item: { label: "Updated Item", variant: "outline" },
      delete_item: { label: "Deleted Item", variant: "destructive" },
      create_user: { label: "Created User", variant: "default" },
      update_user: { label: "Updated User", variant: "outline" },
      delete_user: { label: "Deleted User", variant: "destructive" },
      create_order: { label: "Created Order", variant: "default" },
      update_order: { label: "Updated Order", variant: "outline" },
      delete_order: { label: "Deleted Order", variant: "destructive" },
    };

    const config = actionMap[action] || { label: action, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "user":
        return <User className="h-4 w-4" />;
      case "inventory_item":
        return <Package className="h-4 w-4" />;
      case "order":
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.details?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesUser = userFilter === "all" || log.user.username === userFilter;
    return matchesSearch && matchesAction && matchesUser;
  });

  const uniqueActions = [...new Set(logs.map(log => log.action))];
  const uniqueUsers = [...new Set(logs.map(log => log.user.username))];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
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
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search activity logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map(action => (
              <SelectItem key={action} value={action}>
                {action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {uniqueUsers.map(username => (
              <SelectItem key={username} value={username}>
                {username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Activity Log List */}
      {filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No activity found</h3>
            <p className="text-muted-foreground">
              {searchQuery || actionFilter !== "all" || userFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No activity has been logged yet."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <Card key={log.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                    {getActionIcon(log.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{log.user.username}</span>
                      <span className="text-muted-foreground">•</span>
                      {getActionBadge(log.action)}
                      {log.entityType && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {getEntityIcon(log.entityType)}
                            <span>{log.entityType.replace('_', ' ')}</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {log.details && (
                      <p className="text-sm text-muted-foreground truncate">
                        {log.details}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {log.user.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {logs.filter(l => l.action.includes('create')).length}
              </div>
              <p className="text-sm text-muted-foreground">Created</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {logs.filter(l => l.action.includes('update')).length}
              </div>
              <p className="text-sm text-muted-foreground">Updated</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {logs.filter(l => l.action.includes('delete')).length}
              </div>
              <p className="text-sm text-muted-foreground">Deleted</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {logs.filter(l => l.action === 'login').length}
              </div>
              <p className="text-sm text-muted-foreground">Logins</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}