import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCategorySchema, InsertCategory, Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editCategory?: Category | null;
}

export default function AddCategoryModal({ isOpen, onClose, editCategory }: AddCategoryModalProps) {
  const { toast } = useToast();
  const isEditing = !!editCategory;
  
  const form = useForm<InsertCategory>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: editCategory?.name || "",
      description: editCategory?.description || "",
    },
  });

  const saveCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      if (isEditing && editCategory) {
        const response = await apiRequest("PUT", `/api/categories/${editCategory.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/categories", data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: isEditing ? "Category updated" : "Category created",
        description: `Category has been successfully ${isEditing ? "updated" : "created"}.`,
      });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: `Failed to ${isEditing ? "update" : "create"} category`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCategory) => {
    saveCategoryMutation.mutate(data);
  };

  const handleClose = () => {
    if (!saveCategoryMutation.isPending) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isEditing ? "Edit Category" : "Add New Category"}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={saveCategoryMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter category name"
              disabled={saveCategoryMutation.isPending}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Enter category description (optional)"
              rows={3}
              disabled={saveCategoryMutation.isPending}
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
              disabled={saveCategoryMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-secondary hover:bg-secondary/90"
              disabled={saveCategoryMutation.isPending}
            >
              {saveCategoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditing ? "Update Category" : "Create Category"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}