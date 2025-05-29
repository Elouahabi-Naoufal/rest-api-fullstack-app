import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileText, Database, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InventoryItem, Order, User, ActivityLog } from "@shared/schema";

export default function DataExport() {
  const [exportType, setExportType] = useState<string>("inventory");
  const [exportFormat, setExportFormat] = useState<string>("csv");
  const [includeFields, setIncludeFields] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<string>("all");
  const { toast } = useToast();

  const { data: inventoryItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: activityLogs = [] } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs"],
  });

  const getFieldsForType = (type: string) => {
    switch (type) {
      case "inventory":
        return [
          { id: "name", label: "Product Name" },
          { id: "sku", label: "SKU" },
          { id: "category", label: "Category" },
          { id: "price", label: "Price" },
          { id: "stock", label: "Stock Level" },
          { id: "lowStockAlert", label: "Low Stock Alert" },
          { id: "soldCount", label: "Sold Count" },
          { id: "description", label: "Description" },
          { id: "createdAt", label: "Created Date" },
          { id: "updatedAt", label: "Updated Date" },
        ];
      case "orders":
        return [
          { id: "orderNumber", label: "Order Number" },
          { id: "customerName", label: "Customer Name" },
          { id: "customerEmail", label: "Customer Email" },
          { id: "status", label: "Status" },
          { id: "totalAmount", label: "Total Amount" },
          { id: "orderDate", label: "Order Date" },
          { id: "completedAt", label: "Completed Date" },
          { id: "notes", label: "Notes" },
        ];
      case "users":
        return [
          { id: "username", label: "Username" },
          { id: "email", label: "Email" },
          { id: "role", label: "Role" },
          { id: "createdAt", label: "Created Date" },
        ];
      case "activity":
        return [
          { id: "action", label: "Action" },
          { id: "entityType", label: "Entity Type" },
          { id: "details", label: "Details" },
          { id: "timestamp", label: "Timestamp" },
        ];
      default:
        return [];
    }
  };

  const getCurrentData = () => {
    switch (exportType) {
      case "inventory":
        return inventoryItems;
      case "orders":
        return orders;
      case "users":
        return users;
      case "activity":
        return activityLogs;
      default:
        return [];
    }
  };

  const filterDataByDate = (data: any[]) => {
    if (dateRange === "all") return data;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (dateRange) {
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }

    return data.filter(item => {
      const itemDate = new Date(item.createdAt || item.orderDate || item.timestamp);
      return itemDate >= filterDate;
    });
  };

  const formatDataForExport = (data: any[]) => {
    if (includeFields.length === 0) return data;
    
    return data.map(item => {
      const filteredItem: any = {};
      includeFields.forEach(field => {
        if (item.hasOwnProperty(field)) {
          filteredItem[field] = item[field];
        }
      });
      return filteredItem;
    });
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return "";
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(",")
      )
    ].join("\n");
    
    return csvContent;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const rawData = getCurrentData();
    const filteredData = filterDataByDate(rawData);
    const formattedData = formatDataForExport(filteredData);

    if (formattedData.length === 0) {
      toast({
        title: "No data to export",
        description: "Please adjust your filters or select fields to export.",
        variant: "destructive",
      });
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${exportType}_export_${timestamp}`;

    switch (exportFormat) {
      case "csv":
        const csvContent = convertToCSV(formattedData);
        downloadFile(csvContent, `${filename}.csv`, "text/csv");
        break;
      case "json":
        const jsonContent = JSON.stringify(formattedData, null, 2);
        downloadFile(jsonContent, `${filename}.json`, "application/json");
        break;
      case "txt":
        const txtContent = formattedData.map(item => 
          Object.entries(item).map(([key, value]) => `${key}: ${value}`).join("\n")
        ).join("\n\n");
        downloadFile(txtContent, `${filename}.txt`, "text/plain");
        break;
    }

    toast({
      title: "Export completed",
      description: `Successfully exported ${formattedData.length} records.`,
    });
  };

  const handleFieldToggle = (fieldId: string) => {
    setIncludeFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const currentFields = getFieldsForType(exportType);
  const currentData = getCurrentData();
  const filteredData = filterDataByDate(currentData);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="exportType">Data Type</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">Inventory Items</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="activity">Activity Logs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="exportFormat">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                  <SelectItem value="json">JSON (JavaScript Object)</SelectItem>
                  <SelectItem value="txt">TXT (Plain Text)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Field Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Field Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIncludeFields(currentFields.map(f => f.id))}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIncludeFields([])}
                >
                  Clear All
                </Button>
              </div>
              
              {currentFields.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={includeFields.includes(field.id)}
                    onCheckedChange={() => handleFieldToggle(field.id)}
                  />
                  <Label htmlFor={field.id} className="text-sm">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {currentData.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Records</p>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-secondary">
                {filteredData.length}
              </div>
              <p className="text-sm text-muted-foreground">After Date Filter</p>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {includeFields.length}
              </div>
              <p className="text-sm text-muted-foreground">Selected Fields</p>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {exportFormat.toUpperCase()}
              </div>
              <p className="text-sm text-muted-foreground">Export Format</p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleExport}
              className="bg-secondary hover:bg-secondary/90"
              disabled={includeFields.length === 0 || filteredData.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export {filteredData.length} Records
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}