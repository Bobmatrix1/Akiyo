import { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Search, Eye, Ban, ArrowLeft, Loader2, Mail, Phone, Shield, Calendar, Hash, MoreVertical, UserCog, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Page } from '../../App';
import { getAllUsers, updateUser, deleteUser } from '../../../services/db';
import { format } from 'date-fns';

interface AdminUsersProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onBack?: () => void;
}

export function AdminUsers({ onNavigate, onLogout, onBack }: AdminUsersProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
      fetchUsers();
  }, []);

  const fetchUsers = async () => {
      setLoading(true);
      try {
          const data = await getAllUsers();
          setUsers(data);
      } catch (error) {
          toast.error("Failed to load users");
      } finally {
          setLoading(false);
      }
  };

  const handleViewUser = (user: any) => {
      setSelectedUser(user);
      setIsDialogOpen(true);
  };

  const handleRoleToggle = async (user: any) => {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      try {
          await updateUser(user.id, { role: newRole });
          toast.success(`User role updated to ${newRole}`);
          fetchUsers();
      } catch (error) {
          toast.error("Failed to update user role");
      }
  };

  const handleDeleteUser = async (userId: string) => {
      if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
          try {
              await deleteUser(userId);
              toast.success("User deleted successfully");
              fetchUsers();
          } catch (error) {
              toast.error("Failed to delete user");
          }
      }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar currentPage="admin-users" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="p-6 pl-16 lg:pl-6 flex items-center gap-4">
            <div>
                <h1 className="text-2xl font-semibold">Users</h1>
                <p className="text-sm text-muted-foreground">Manage customer accounts</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 space-y-6">
          {/* Back Button (Bottom Left) */}
          {onBack && (
            <div className="fixed bottom-6 left-6 lg:left-72 z-50">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={onBack} 
                    className="rounded-full h-12 w-12 shadow-lg bg-background border-2 hover:bg-accent transition-all active:scale-90"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                <h3 className="text-2xl font-bold">{users.length}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Admins</p>
                <h3 className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Customers</p>
                <h3 className="text-2xl font-bold">{users.filter(u => u.role !== 'admin').length}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <h3 className="text-2xl font-bold text-green-600">Active</h3>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
              {loading ? (
                  <div className="flex justify-center p-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">User</TableHead>
                    <TableHead className="whitespace-nowrap">Role</TableHead>
                    <TableHead className="whitespace-nowrap">Email</TableHead>
                    <TableHead className="whitespace-nowrap">Phone</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="text-[10px]">
                              {user.name
                                ?.split(' ')
                                .map((n: string) => n[0])
                                .join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.name || 'Anonymous'}</p>
                            <p className="text-[10px] text-muted-foreground">ID: {user.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                          {user.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{user.phone || 'N/A'}</TableCell>
                                                                  <TableCell className="text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                      <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)}>
                                                                        <Eye className="h-4 w-4" />
                                                                      </Button>
                                                                      
                                                                      <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="sm">
                                                                                <MoreVertical className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem onClick={() => handleRoleToggle(user)}>
                                                                                <UserCog className="mr-2 h-4 w-4" />
                                                                                <span>{user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}</span>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem 
                                                                                className="text-destructive focus:text-destructive"
                                                                                onClick={() => handleDeleteUser(user.id)}
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                <span>Delete User</span>
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                      </DropdownMenu>
                                                                    </div>
                                                                  </TableCell>
                                            
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                    )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </main>
                      
                              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                  <DialogContent className="sm:max-w-md">
                                      <DialogHeader>
                                          <DialogTitle>User Details</DialogTitle>
                                          <DialogDescription>
                                              Full information for the selected customer account.
                                          </DialogDescription>
                                      </DialogHeader>
                                      
                                      {selectedUser && (
                                          <div className="space-y-6 pt-4">
                                              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                                                  <Avatar className="h-16 w-16 border-2 border-background">
                                                      <AvatarImage src={selectedUser.avatar} />
                                                      <AvatarFallback className="text-xl">
                                                          {selectedUser.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                                      </AvatarFallback>
                                                  </Avatar>
                                                  <div>
                                                      <h3 className="text-lg font-semibold">{selectedUser.name || 'Anonymous'}</h3>
                                                      <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'}>
                                                          {selectedUser.role || 'user'}
                                                      </Badge>
                                                  </div>
                                              </div>
                      
                                              <div className="grid gap-4">
                                                  <div className="flex items-center gap-3 text-sm">
                                                      <Mail className="h-4 w-4 text-muted-foreground" />
                                                      <div className="flex flex-col">
                                                          <span className="text-muted-foreground text-[10px] uppercase font-semibold">Email</span>
                                                          <span>{selectedUser.email}</span>
                                                      </div>
                                                  </div>
                                                  <div className="flex items-center gap-3 text-sm">
                                                      <Phone className="h-4 w-4 text-muted-foreground" />
                                                      <div className="flex flex-col">
                                                          <span className="text-muted-foreground text-[10px] uppercase font-semibold">Phone</span>
                                                          <span>{selectedUser.phone || 'Not provided'}</span>
                                                      </div>
                                                  </div>
                                                  <div className="flex items-center gap-3 text-sm">
                                                      <Hash className="h-4 w-4 text-muted-foreground" />
                                                      <div className="flex flex-col">
                                                          <span className="text-muted-foreground text-[10px] uppercase font-semibold">User ID</span>
                                                          <span className="font-mono">{selectedUser.id}</span>
                                                      </div>
                                                  </div>
                                                  <div className="flex items-center gap-3 text-sm">
                                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                                      <div className="flex flex-col">
                                                          <span className="text-muted-foreground text-[10px] uppercase font-semibold">Joined On</span>
                                                          <span>
                                                              {selectedUser.createdAt?.seconds 
                                                                  ? format(new Date(selectedUser.createdAt.seconds * 1000), 'PPP') 
                                                                  : 'N/A'}
                                                          </span>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      )}
                      
                                      <DialogFooter className="sm:justify-start">
                                          <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
                                              Close
                                          </Button>
                                      </DialogFooter>
                                  </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        );
                      }
                      