import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema, InsertTask, Task, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface TaskWithUsers extends Task {
  assignedTo: User;
  assignedBy: User;
}

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: TaskWithUsers | null;
}

export default function AddTaskModal({ isOpen, onClose, editTask }: AddTaskModalProps) {
  const { toast } = useToast();
  const isEditing = !!editTask;
  
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: editTask?.title || "",
      description: editTask?.description || "",
      priority: editTask?.priority || "medium",
      status: editTask?.status || "pending",
      assignedToId: editTask?.assignedToId || undefined,
      dueDate: editTask?.dueDate ? new Date(editTask.dueDate).toISOString().split('T')[0] : "",
    },
  });

  const saveTaskMutation = useMutation({
    mutationFn: async (data: InsertTask) => {
      const taskData = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      };
      
      if (isEditing && editTask) {
        const response = await apiRequest("PUT", `/api/tasks/${editTask.id}`, taskData);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/tasks", taskData);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: isEditing ? "Task updated" : "Task created",
        description: `Task has been successfully ${isEditing ? "updated" : "created"}.`,
      });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: `Failed to ${isEditing ? "update" : "create"} task`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTask) => {
    saveTaskMutation.mutate(data);
  };

  const handleClose = () => {
    if (!saveTaskMutation.isPending) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isEditing ? "Edit Task" : "Add New Task"}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={saveTaskMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Enter task title"
              disabled={saveTaskMutation.isPending}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Enter task description (optional)"
              rows={3}
              disabled={saveTaskMutation.isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(value) => form.setValue("priority", value as any)}
                disabled={saveTaskMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as any)}
                disabled={saveTaskMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="assignedToId">Assign To</Label>
            <Select
              value={form.watch("assignedToId")?.toString()}
              onValueChange={(value) => form.setValue("assignedToId", parseInt(value))}
              disabled={saveTaskMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.username} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              {...form.register("dueDate")}
              disabled={saveTaskMutation.isPending}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={saveTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-secondary hover:bg-secondary/90"
              disabled={saveTaskMutation.isPending}
            >
              {saveTaskMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditing ? "Update Task" : "Create Task"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}