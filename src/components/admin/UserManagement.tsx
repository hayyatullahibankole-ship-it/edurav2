import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  UserPlus,
  Shield,
  AlertTriangle,
  UserX
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { emailSchema, passwordSchema, nameSchema, adminUserSchema } from '@/utils/inputValidation';

interface UserManagementProps {
  users: any[];
  onRefresh: () => void;
}

export default function UserManagement({ users, onRefresh }: UserManagementProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'student'
  });

  const exportUsers = async () => {
    try {
      // Create CSV content
      const headers = ['Email', 'First Name', 'Last Name', 'Phone', 'Country', 'Created At', 'Last Login', 'Is Suspended'];
      const csvContent = [
        headers.join(','),
        ...users.map(user => [
          user.email || '',
          user.first_name || '',
          user.last_name || '',
          user.phone || '',
          user.country || '',
          new Date(user.created_at).toLocaleDateString(),
          user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never',
          user.is_suspended ? 'Yes' : 'No'
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Users exported successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export users",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async () => {
    try {
      setLoading(true);
      
      // Create user profile in database
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: newUser.email,
          first_name: newUser.firstName,
          last_name: newUser.lastName,
          phone: newUser.phone || null
        })
        .select()
        .single();

      if (error) throw error;

      // Assign role
      await supabase
        .from('user_roles')
        .insert({
          user_id: data.id,
          role: newUser.role as 'student' | 'admin' | 'super_admin' | 'tutor'
        });

      toast({
        title: "Success",
        description: "User created successfully"
      });

      setIsAddModalOpen(false);
      setNewUser({ email: '', firstName: '', lastName: '', phone: '', role: 'student' });
      onRefresh();
      
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('users')
        .update({
          first_name: selectedUser.first_name,
          last_name: selectedUser.last_name,
          phone: selectedUser.phone,
          email: selectedUser.email
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Success", 
        description: "User updated successfully"
      });

      setIsEditModalOpen(false);
      setSelectedUser(null);
      onRefresh();
      
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will permanently delete all their data including exam attempts, results, and subscriptions.')) return;
    
    try {
      setLoading(true);
      console.log('Starting delete for user:', userId);
      
      // Call the database function to delete user by app ID
      const { data: rpcResult, error: rpcError } = await supabase.rpc('delete_user_completely_by_app_id', {
        user_app_id: userId
      });

      if (rpcError) {
        console.error('Error from delete function:', rpcError);
        throw rpcError;
      }

      if (!rpcResult) {
        throw new Error('User deletion failed - function returned false');
      }

      console.log('User deleted successfully');

      toast({
        title: "Success",
        description: "User and all associated data deleted permanently"
      });

      onRefresh();
      
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error", 
        description: `Failed to delete user: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSuspension = async (userId: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('users')
        .update({ is_suspended: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${!currentStatus ? 'suspended' : 'activated'} successfully`
      });

      onRefresh();
      
    } catch (error) {
      console.error('Error toggling user suspension:', error);
      toast({
        title: "Error",
        description: "Failed to update user status", 
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteFreeAccountsWithoutSubscription = async () => {
    const confirmation = confirm(
      'Are you sure you want to delete ALL free accounts that have never subscribed? This action cannot be undone and will permanently delete:\n\n' +
      '- Users who have never had any paid subscription\n' +
      '- All their data including attempts and progress\n\n' +
      'This will NOT delete:\n' +
      '- Users with active subscriptions\n' +
      '- Users who had paid subscriptions (even if expired)\n' +
      '- School students\n' +
      '- Admin accounts'
    );

    if (!confirmation) return;

    try {
      setLoading(true);
      
      // Find users who have never had a paid subscription
      const { data: freeUsers, error: fetchError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          subscriptions!inner(
            id,
            status,
            subscription_plans!inner(
              price,
              resource_access_level
            )
          ),
          user_roles!inner(role)
        `);

      if (fetchError) throw fetchError;

      // Also get users with no subscriptions at all
      const { data: noSubUsers, error: noSubError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, user_roles!inner(role)')
        .not('id', 'in', `(SELECT user_id FROM subscriptions)`);

      if (noSubError) throw noSubError;

      // Filter to only free accounts (no paid subs ever, not admins, not school students)
      const usersToDelete: string[] = [];
      
      // Check users with subscriptions - only delete if they've NEVER had a paid one
      if (freeUsers) {
        for (const user of freeUsers) {
          const isAdmin = user.user_roles?.some((r: any) => 
            ['admin', 'super_admin'].includes(r.role)
          );
          
          if (isAdmin) continue;

          const hasPaidSub = user.subscriptions?.some((sub: any) => 
            sub.subscription_plans?.price > 0
          );

          if (!hasPaidSub) {
            usersToDelete.push(user.id);
          }
        }
      }

      // Add users with no subscriptions (excluding admins)
      if (noSubUsers) {
        for (const user of noSubUsers) {
          const isAdmin = user.user_roles?.some((r: any) => 
            ['admin', 'super_admin'].includes(r.role)
          );
          
          if (!isAdmin) {
            usersToDelete.push(user.id);
          }
        }
      }

      // Check if they're school students
      const { data: schoolStudents } = await supabase
        .from('school_students')
        .select('user_id')
        .in('user_id', usersToDelete);

      const schoolStudentIds = new Set(schoolStudents?.map(s => s.user_id) || []);
      const finalUsersToDelete = usersToDelete.filter(id => !schoolStudentIds.has(id));

      if (finalUsersToDelete.length === 0) {
        toast({
          title: "No Users to Delete",
          description: "No free accounts without subscriptions found"
        });
        return;
      }

      const secondConfirmation = confirm(
        `Found ${finalUsersToDelete.length} free accounts to delete. Continue?`
      );

      if (!secondConfirmation) return;

      // Delete users one by one
      let successCount = 0;
      let failCount = 0;

      for (const userId of finalUsersToDelete) {
        try {
          const { data, error } = await supabase.rpc('delete_user_completely_by_app_id', {
            user_app_id: userId
          });

          if (error || !data) {
            console.error('Failed to delete user:', userId, error);
            failCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error('Error deleting user:', userId, err);
          failCount++;
        }
      }

      toast({
        title: "Bulk Delete Complete",
        description: `Successfully deleted ${successCount} users. ${failCount > 0 ? `Failed: ${failCount}` : ''}`
      });

      onRefresh();
      
    } catch (error) {
      console.error('Error deleting free accounts:', error);
      toast({
        title: "Error",
        description: "Failed to delete free accounts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-slate-400">Manage system users and permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="destructive" 
            onClick={deleteFreeAccountsWithoutSubscription}
            disabled={loading}
          >
            <UserX className="w-4 h-4 mr-2" />
            Delete Free Accounts
          </Button>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="user@edura.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="+234 xxx xxx xxxx"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleAddUser} disabled={loading} className="flex-1">
                    {loading ? 'Creating...' : 'Create User'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={exportUsers}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <Badge className="bg-slate-700 text-slate-300">
              {filteredUsers.length} users
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="space-y-4">
            {filteredUsers.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                    {user.profile_image_url ? (
                      <img src={user.profile_image_url} alt="Profile" className="w-12 h-12 rounded-full" />
                    ) : (
                      <Users className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-white">
                        {user.first_name} {user.last_name}
                      </p>
                      {user.is_verified && (
                        <Shield className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-400">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                      </Badge>
                      {user.last_login_at && (
                        <Badge variant="outline" className="text-xs">
                          Last active: {new Date(user.last_login_at).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {user.is_suspended && (
                    <Badge className="bg-red-600 text-white">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Suspended
                    </Badge>
                  )}
                  
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSelectedUser(user);
                    setIsViewModalOpen(true);
                  }}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedUser(user);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleUserSuspension(user.id, user.is_suspended)}
                    disabled={loading}
                  >
                    {user.is_suspended ? 'Activate' : 'Suspend'}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={loading}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={selectedUser.first_name || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={selectedUser.last_name || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, last_name: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={selectedUser.email || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={selectedUser.phone || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleEditUser} disabled={loading} className="flex-1">
                  {loading ? 'Updating...' : 'Update User'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center">
                  {selectedUser.profile_image_url ? (
                    <img src={selectedUser.profile_image_url} alt="Profile" className="w-16 h-16 rounded-full" />
                  ) : (
                    <Users className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.first_name} {selectedUser.last_name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {selectedUser.is_verified && (
                      <Badge className="bg-green-600">Verified</Badge>
                    )}
                    {selectedUser.is_suspended && (
                      <Badge className="bg-red-600">Suspended</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-muted-foreground">Phone:</span> {selectedUser.phone || 'Not provided'}</div>
                    <div><span className="text-muted-foreground">Date of Birth:</span> {selectedUser.date_of_birth ? new Date(selectedUser.date_of_birth).toLocaleDateString() : 'Not provided'}</div>
                    <div><span className="text-muted-foreground">Country:</span> {selectedUser.country || 'Not provided'}</div>
                    <div><span className="text-muted-foreground">State:</span> {selectedUser.state || 'Not provided'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-muted-foreground">Created:</span> {new Date(selectedUser.created_at).toLocaleDateString()}</div>
                    <div><span className="text-muted-foreground">Last Login:</span> {selectedUser.last_login_at ? new Date(selectedUser.last_login_at).toLocaleDateString() : 'Never'}</div>
                    <div><span className="text-muted-foreground">2FA Enabled:</span> {selectedUser.two_fa_enabled ? 'Yes' : 'No'}</div>
                    <div><span className="text-muted-foreground">Account Status:</span> {selectedUser.is_suspended ? 'Suspended' : 'Active'}</div>
                  </div>
                </div>
              </div>

              {selectedUser.address && (
                <div>
                  <h4 className="font-medium mb-2">Address</h4>
                  <p className="text-sm text-muted-foreground">{selectedUser.address}</p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}