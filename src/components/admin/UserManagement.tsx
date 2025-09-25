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
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      
      // First, get user's attempts to delete related records
      const { data: userAttempts } = await supabase
        .from('attempts')
        .select('id')
        .eq('user_id', userId);

      console.log('User attempts:', userAttempts);

      // Delete attempt-related records if any exist
      if (userAttempts && userAttempts.length > 0) {
        const attemptIds = userAttempts.map(a => a.id);
        
        // Delete attempt answers and results first
        const { error: answersError } = await supabase.from('attempt_answers').delete().in('attempt_id', attemptIds);
        if (answersError) console.error('Error deleting answers:', answersError);
        
        const { error: resultsError } = await supabase.from('results').delete().in('attempt_id', attemptIds);
        if (resultsError) console.error('Error deleting results:', resultsError);
        
        const { error: attemptsError } = await supabase.from('attempts').delete().eq('user_id', userId);
        if (attemptsError) console.error('Error deleting attempts:', attemptsError);
      }
      
      // Delete other user-related records
      const { error: rolesError } = await supabase.from('user_roles').delete().eq('user_id', userId);
      if (rolesError) console.error('Error deleting roles:', rolesError);
      
      const { error: subscriptionsError } = await supabase.from('subscriptions').delete().eq('user_id', userId);
      if (subscriptionsError) console.error('Error deleting subscriptions:', subscriptionsError);
      
      const { error: transactionsError } = await supabase.from('transactions').delete().eq('user_id', userId);
      if (transactionsError) console.error('Error deleting transactions:', transactionsError);
      
      const { error: notificationsError } = await supabase.from('notifications').delete().eq('user_id', userId);
      if (notificationsError) console.error('Error deleting notifications:', notificationsError);
      
      const { error: bookingsError } = await supabase.from('bookings').delete().eq('user_id', userId);
      if (bookingsError) console.error('Error deleting bookings:', bookingsError);

      // Finally delete the user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }

      console.log('User deleted successfully');

      toast({
        title: "Success",
        description: "User and all associated data deleted successfully"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-slate-400">Manage system users and permissions</p>
        </div>
        <div className="flex items-center space-x-3">
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
                    placeholder="user@educore.com"
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
                  
                  <Button variant="ghost" size="sm" onClick={() => {/* View user details */}}>
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
    </div>
  );
}