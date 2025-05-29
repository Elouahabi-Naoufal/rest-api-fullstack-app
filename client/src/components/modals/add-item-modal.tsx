import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInventoryItemSchema, InsertInventoryItem, InventoryItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: InventoryItem | null;
}

export default function AddItemModal({ isOpen, onClose, editItem }: AddItemModalProps) {
  const { toast } = useToast();
  const isEditing = !!editItem;
  
  const form = useForm<InsertInventoryItem>({
    resolver: zodResolver(insertInventoryItemSchema),
    defaultValues: {
      name: editItem?.name || "",
      sku: editItem?.sku || "",
      category: editItem?.category || "",
      description: editItem?.description || "",
      price: editItem?.price || "0",
      stock: editItem?.stock || 0,
      lowStockAlert: editItem?.lowStockAlert || 5,
      imageUrl: editItem?.imageUrl || "",
    },
  });

  const saveItemMutation = useMutation({
    mutationFn: async (data: InsertInventoryItem) => {
      if (isEditing && editItem) {
        const response = await apiRequest("PUT", `/api/inventory/${editItem.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/inventory", data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-stats"] });
      toast({
        title: isEditing ? "Item updated" : "Item added",
        description: `Inventory item has been successfully ${isEditing ? "updated" : "added"}.`,
      });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: `Failed to ${isEditing ? "update" : "add"} item`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertInventoryItem) => {
    saveItemMutation.mutate(data);
  };

  const handleClose = () => {
    if (!saveItemMutation.isPending) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add New Item
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={createItemMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter product name"
                disabled={createItemMutation.isPending}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                {...form.register("sku")}
                placeholder="Enter SKU"
                disabled={createItemMutation.isPending}
              />
              {form.formState.errors.sku && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.sku.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(value) => form.setValue("category", value)}
                disabled={createItemMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Classic">Classic</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...form.register("price")}
                placeholder="0.00"
                disabled={createItemMutation.isPending}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Initial Stock</Label>
              <Input
                id="stock"
                type="number"
                {...form.register("stock", { valueAsNumber: true })}
                placeholder="0"
                disabled={createItemMutation.isPending}
              />
              {form.formState.errors.stock && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.stock.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
              <Input
                id="lowStockAlert"
                type="number"
                {...form.register("lowStockAlert", { valueAsNumber: true })}
                placeholder="5"
                disabled={createItemMutation.isPending}
              />
              {form.formState.errors.lowStockAlert && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.lowStockAlert.message}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Enter product description"
              rows={3}
              disabled={createItemMutation.isPending}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createItemMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-secondary hover:bg-secondary/90"
              disabled={createItemMutation.isPending}
            >
              {createItemMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Item"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
