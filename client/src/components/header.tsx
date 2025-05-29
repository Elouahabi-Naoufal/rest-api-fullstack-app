import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { User } from "@shared/schema";

interface HeaderProps {
  sectionInfo: {
    title: string;
    description: string;
  };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user: User;
}

export default function Header({ sectionInfo, searchQuery, onSearchChange, user }: HeaderProps) {
  const getUserInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-card shadow-custom px-6 py-4 border-b">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{sectionInfo.title}</h1>
          <p className="text-muted-foreground">{sectionInfo.description}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-accent text-accent-foreground text-sm font-medium">
                {getUserInitials(user.username)}
              </AvatarFallback>
            </Avatar>
            <span className="text-foreground font-medium">{user.username}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
