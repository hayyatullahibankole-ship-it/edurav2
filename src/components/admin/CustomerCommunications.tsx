import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, MessageCircle, Send, Users, Search, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomerCommunicationsProps {
  users: any[];
}

export default function CustomerCommunications({ users }: CustomerCommunicationsProps) {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
    type: 'email' as 'email' | 'whatsapp' | 'both'
  });

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive"
      });
      return;
    }

    if (!messageForm.subject || !messageForm.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setSending(true);
      
      const { data, error } = await supabase.functions.invoke('send-customer-message', {
        body: {
          userId: selectedUser.id,
          subject: messageForm.subject,
          message: messageForm.message,
          type: messageForm.type
        }
      });

      if (error) throw error;

      // Check results
      const results = data as { email?: any; whatsapp?: any };
      let successCount = 0;
      let failureMessages = [];

      if (results.email?.success) successCount++;
      else if (results.email) failureMessages.push(`Email: ${results.email.error}`);

      if (results.whatsapp?.success) successCount++;
      else if (results.whatsapp) failureMessages.push(`WhatsApp: ${results.whatsapp.error}`);

      if (successCount > 0) {
        toast({
          title: "Success",
          description: `Message sent successfully via ${successCount} channel${successCount > 1 ? 's' : ''}${failureMessages.length > 0 ? '. ' + failureMessages.join(', ') : ''}`,
        });
        
        setIsComposing(false);
        setMessageForm({ subject: '', message: '', type: 'email' });
        setSelectedUser(null);
      } else {
        throw new Error(failureMessages.join(', ') || 'Failed to send message');
      }
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Customer Communications</h2>
          <p className="text-slate-400">Send messages directly to your customers</p>
        </div>
        <Dialog open={isComposing} onOpenChange={setIsComposing}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Compose Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Send Message to Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient</Label>
                <Select 
                  value={selectedUser?.id || ''} 
                  onValueChange={(value) => {
                    const user = users.find(u => u.id === value);
                    setSelectedUser(user);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} - {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="messageType">Channel</Label>
                <Select 
                  value={messageForm.type} 
                  onValueChange={(value: 'email' | 'whatsapp' | 'both') => 
                    setMessageForm({...messageForm, type: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Only
                      </div>
                    </SelectItem>
                    <SelectItem value="whatsapp">
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp Only (Coming Soon)
                      </div>
                    </SelectItem>
                    <SelectItem value="both">
                      <div className="flex items-center">
                        <Send className="w-4 h-4 mr-2" />
                        Both Channels
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
                  placeholder="Enter message subject"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}
                  placeholder="Type your message here..."
                  rows={6}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSendMessage} 
                  disabled={sending || !selectedUser}
                  className="flex-1"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsComposing(false)}
                  disabled={sending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Customers</p>
                <p className="text-3xl font-bold text-blue-400">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">With Email</p>
                <p className="text-3xl font-bold text-green-400">
                  {users.filter(u => u.email).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">With Phone</p>
                <p className="text-3xl font-bold text-purple-400">
                  {users.filter(u => u.phone).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Customer Directory</CardTitle>
          <div className="relative mt-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedUser(user);
                  setIsComposing(true);
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                    {user.phone && (
                      <p className="text-xs text-slate-500">{user.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user.email && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </Badge>
                  )}
                  {user.phone && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                      <Phone className="w-3 h-3 mr-1" />
                      Phone
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No customers found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
