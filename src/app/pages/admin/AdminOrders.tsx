import { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { Search, Eye, Loader2, MapPin, Phone, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Page } from '../../App';
import { getAllOrders, updateOrderStatus, type Order } from '../../../services/db';
import { format } from 'date-fns';

interface AdminOrdersProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onBack?: () => void;
}

const statusColors: any = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
  refunded: 'bg-gray-500',
};

const statusLabels: any = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export function AdminOrders({ onNavigate, onLogout, onBack }: AdminOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
      fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
        const data = await getAllOrders();
        setOrders(data);
    } catch (error) {
        console.error("Failed to fetch orders", error);
        toast.error("Failed to load orders");
    } finally {
        setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
        await updateOrderStatus(orderId, newStatus as any);
        toast.success(`Order ${orderId.slice(0, 8)} status updated to ${newStatus}`);
        fetchOrders(); // Refresh
        if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder(prev => prev ? {...prev, status: newStatus as any} : null);
        }
    } catch (error) {
        console.error("Failed to update status", error);
        toast.error("Failed to update order status");
    }
  };

  const handleViewOrder = (order: Order) => {
      setSelectedOrder(order);
      setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar currentPage="admin-orders" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="p-6 flex items-center gap-4 pl-16 lg:pl-6">
            <div>
                <h1 className="text-2xl font-semibold">Orders</h1>
                <p className="text-sm text-muted-foreground">Manage customer orders</p>
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
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders by ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
               {loading ? (
                  <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Order ID</TableHead>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead className="whitespace-nowrap">Customer</TableHead>
                    <TableHead className="whitespace-nowrap text-center">Items</TableHead>
                    <TableHead className="whitespace-nowrap">Total</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <p className="font-medium text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="min-w-[150px]">
                          <p className="font-medium text-sm">{order.shippingAddress?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.shippingAddress?.phone || 'N/A'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">{order.items?.length || 0}</TableCell>
                      <TableCell className="font-semibold text-sm">₦{(order.totalAmount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <Badge className={statusColors[order.status] || 'bg-gray-500'}>
                              {statusLabels[order.status] || order.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            {order.status === 'cancelled' && (
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-xs h-8"
                                    onClick={() => handleStatusChange(order.id, 'refunded')}
                                >
                                    Refund
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                            <Eye className="h-4 w-4" />
                            </Button>
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                    <DialogDescription>Order ID: {selectedOrder?.id}</DialogDescription>
                </DialogHeader>
                
                {selectedOrder && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-6">
                            {/* Shipping Info */}
                            <Card>
                                <CardContent className="p-4 space-y-3">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> Shipping Address
                                    </h3>
                                    <div className="text-sm space-y-1">
                                        <p className="font-medium">{selectedOrder.shippingAddress?.name}</p>
                                        <p>{selectedOrder.shippingAddress?.street}</p>
                                        <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                                        <p>{selectedOrder.shippingAddress?.zipCode}</p>
                                        <p>{selectedOrder.shippingAddress?.country}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm pt-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{selectedOrder.shippingAddress?.phone}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status */}
                            <Card>
                                <CardContent className="p-4 space-y-3">
                                    <h3 className="font-semibold">Order Status</h3>
                                    <Select
                                        value={selectedOrder.status}
                                        onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="shipped">Shipped</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                            <SelectItem value="refunded">Refunded</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            {/* Items */}
                            <Card>
                                <CardContent className="p-4 space-y-4">
                                    <h3 className="font-semibold">Order Items</h3>
                                    <div className="space-y-4">
                                        {selectedOrder.items?.map((item: any, index: number) => (
                                            <div key={index} className="flex gap-3">
                                                <img 
                                                    src={item.product?.image} 
                                                    alt={item.product?.name} 
                                                    className="w-12 h-12 object-cover rounded" 
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium line-clamp-2">{item.product?.name}</p>
                                                    <div className="text-xs text-muted-foreground flex justify-between mt-1">
                                                        <span>Qty: {item.quantity}</span>
                                                        <span>₦{item.product?.price}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4 border-t flex justify-between font-bold">
                                        <span>Total</span>
                                        <span>₦{selectedOrder.totalAmount?.toFixed(2)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
                
                <DialogFooter>
                    <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
