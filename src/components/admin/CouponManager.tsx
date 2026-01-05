import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Ticket, Users, Calendar, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Coupon {
  id: string;
  code: string;
  usage_limit: number;
  used_count: number;
  expiry_date: string;
  is_active: boolean;
  description: string | null;
  created_at: string;
}

export function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    usage_limit: 20,
    expiry_days: 30,
    description: ''
  });

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async () => {
    if (!newCoupon.code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCreating(true);
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + newCoupon.expiry_days);

      const { data: authData } = await supabase.auth.getUser();
      const authUserId = authData.user?.id;

      let createdBy: string | null = null;
      if (authUserId) {
        const { data: appUser } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', authUserId)
          .maybeSingle();

        createdBy = appUser?.id ?? null;
      }

      const { error } = await supabase.from('promo_coupons').insert({
        code: newCoupon.code.toUpperCase().trim(),
        usage_limit: newCoupon.usage_limit,
        expiry_date: expiryDate.toISOString().split('T')[0],
        description: newCoupon.description || null,
        created_by: createdBy
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('A coupon with this code already exists');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Coupon created successfully');
      setNewCoupon({ code: '', usage_limit: 20, expiry_days: 30, description: '' });
      setDialogOpen(false);
      fetchCoupons();
    } catch (err) {
      console.error('Error creating coupon:', err);
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as any).message)
          : 'Failed to create coupon';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promo_coupons')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setCoupons(prev => prev.map(c => 
        c.id === id ? { ...c, is_active: !currentStatus } : c
      ));
      toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (err) {
      console.error('Error toggling coupon:', err);
      toast.error('Failed to update coupon');
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const { error } = await supabase
        .from('promo_coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success('Coupon deleted');
    } catch (err) {
      console.error('Error deleting coupon:', err);
      toast.error('Failed to delete coupon');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Promo Coupons
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Promo Coupon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <Input
                  placeholder="e.g., EDURA2025"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon(prev => ({ 
                    ...prev, 
                    code: e.target.value.toUpperCase() 
                  }))}
                  className="uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Usage Limit</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newCoupon.usage_limit}
                    onChange={(e) => setNewCoupon(prev => ({ 
                      ...prev, 
                      usage_limit: parseInt(e.target.value) || 1 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valid for (days)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newCoupon.expiry_days}
                    onChange={(e) => setNewCoupon(prev => ({ 
                      ...prev, 
                      expiry_days: parseInt(e.target.value) || 1 
                    }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  placeholder="e.g., 1-month free trial for new students"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon(prev => ({ 
                    ...prev, 
                    description: e.target.value 
                  }))}
                />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Coupon
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {coupons.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No coupons created yet. Click "Create Coupon" to get started.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => {
                const isExpired = new Date(coupon.expiry_date) < new Date();
                const isFull = coupon.used_count >= coupon.usage_limit;
                
                return (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div>
                        <code className="font-mono font-semibold">{coupon.code}</code>
                        {coupon.description && (
                          <p className="text-xs text-muted-foreground">{coupon.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{coupon.used_count} / {coupon.usage_limit}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(coupon.expiry_date), 'MMM d, yyyy')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isExpired ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : isFull ? (
                        <Badge variant="secondary">Full</Badge>
                      ) : coupon.is_active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={coupon.is_active}
                          onCheckedChange={() => toggleActive(coupon.id, coupon.is_active)}
                          disabled={isExpired}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCoupon(coupon.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
