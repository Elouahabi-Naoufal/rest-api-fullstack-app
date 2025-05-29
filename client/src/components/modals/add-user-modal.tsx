import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, InsertUser, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editUser?: User | null;
}

export default function AddUserModal({ isOpen, onClose, editUser }: AddUserModalProps) {
  const { toast } = useToast();
  const isEditing = !!editUser;
  
  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: editUser?.username || "",
      email: editUser?.email || "",
      password: "",
      role: editUser?.role || "staff",
    },
  });

  const saveUserMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      if (isEditing && editUser) {
        const response = await apiRequest("PUT", `/api/users/${editUser.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/register", data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: isEditing ? "User updated" : "User created",
        description: `User has been successfully ${isEditing ? "updated" : "created"}.`,
      });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: `Failed to ${isEditing ? "update" : "create"} user`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertUser) => {
    saveUserMutation.mutate(data);
  };

  const handleClose = () => {
    if (!saveUserMutation.isPending) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isEditing ? "Edit User" : "Add New User"}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={saveUserMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...form.register("username")}
              placeholder="Enter username"
              disabled={saveUserMutation.isPending}
            />
            {form.formState.errors.username && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="Enter email"
              disabled={saveUserMutation.isPending}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              placeholder={isEditing ? "Leave blank to keep current password" : "Enter password"}
              disabled={saveUserMutation.isPending}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={form.watch("role")}
              onValueChange={(value) => form.setValue("role", value as "admin" | "staff")}
              disabled={saveUserMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={saveUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-secondary hover:bg-secondary/90"
              disabled={saveUserMutation.isPending}
            >
              {saveUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditing ? "Update User" : "Create User"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}