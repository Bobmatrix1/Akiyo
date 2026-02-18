import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter,
    DialogClose
} from '../components/ui/dialog';
import { 
    ArrowLeft, 
    MapPin, 
    Truck, 
    Package, 
    CheckCircle2, 
    Loader2, 
    Ban 
} from 'lucide-react';
import type { Order } from '../data/mock-data';
import type { Page } from '../App';
import { getOrderById, cancelOrder } from '../../services/db';
import { toast } from 'sonner';
import { format, addHours } from 'date-fns';

interface OrderDetailsProps {
  orderId: string;
  orders: Order[]; // Keep for compatibility, but we will fetch if empty
  onNavigate: (page: Page, productId?: string) => void;
  onBack: () => void;
}

const statusColors: any = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const statusLabels: any = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function OrderDetails({ orderId, orders, onNavigate, onBack }: OrderDetailsProps) {
  const [order, setOrder] = useState<any>(orders.find(o => o.id === orderId));
  const [loading, setLoading] = useState(!order);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!order && orderId) {
        setLoading(true);
        try {
          const data = await getOrderById(orderId);
          setOrder(data);
        } catch (error) {
          console.error("Error fetching order:", error);
          toast.error("Failed to load order details");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchOrder();
  }, [orderId, order]);

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Button onClick={onBack}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  const dateStr = order.createdAt?.seconds 
    ? format(new Date(order.createdAt.seconds * 1000), 'PPP') 
    : order.date || 'Recent';

  const handleCancelOrder = async () => {
      if (confirm("Are you sure you want to cancel this order?")) {
          try {
              await cancelOrder(order.id);
              setOrder({ ...order, status: 'cancelled' });
              toast.success("Order cancelled successfully");
          } catch (error) {
              console.error("Failed to cancel order", error);
              toast.error("Failed to cancel order");
          }
      }
  };

  const getTrackingTimeline = () => {
      const baseDate = order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : new Date();
      const timeline = [
          { status: 'Order Placed', time: format(baseDate, 'p, MMM d'), completed: true },
          { status: 'Processed', time: format(addHours(baseDate, 2), 'p, MMM d'), completed: order.status !== 'pending' },
          { status: 'Shipped', time: format(addHours(baseDate, 24), 'p, MMM d'), completed: order.status === 'shipped' || order.status === 'delivered' },
          { status: 'Out for Delivery', time: 'Pending', completed: order.status === 'delivered' },
      ];
      return timeline;
  };

  const trackingSteps = [
    { label: 'Order Placed', icon: Package, completed: true },
    { label: 'Processing', icon: Package, completed: order.status !== 'pending' },
    { label: 'Shipped', icon: Truck, completed: order.status === 'shipped' || order.status === 'delivered' },
    { label: 'Delivered', icon: CheckCircle2, completed: order.status === 'delivered' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center gap-3 p-4">
          <button onClick={onBack}>
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-xl font-semibold">Order Details</h1>
            <p className="text-sm text-muted-foreground">Order #{order.id.slice(0,8).toUpperCase()}</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Order Status */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Status</p>
                <Badge className={statusColors[order.status]}>
                  {statusLabels[order.status]}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                <p className="font-medium">{dateStr}</p>
              </div>
            </div>

            {/* Tracking Timeline */}
            {order.status !== 'cancelled' && (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
                <div className="space-y-6">
                  {trackingSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={index} className="flex items-start gap-4 relative">
                        <div
                          className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 pt-1">
                          <p className={`font-medium ${step.completed ? '' : 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="bg-accent p-2 rounded-lg">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Shipping Address</h3>
                <p className="text-sm text-muted-foreground">{order.shippingAddress?.name}</p>
                <p className="text-sm text-muted-foreground">{order.shippingAddress?.street}</p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                  {order.shippingAddress?.zipCode}
                </p>
                <p className="text-sm text-muted-foreground">{order.shippingAddress?.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items?.map((item: any, index: number) => (
                <div key={index}>
                  <div className="flex gap-4">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="w-20 h-20 object-cover rounded-md cursor-pointer"
                      onClick={() => onNavigate('product-details', item.product?.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-medium line-clamp-2 cursor-pointer hover:text-primary"
                        onClick={() => onNavigate('product-details', item.product?.id)}
                      >
                        {item.product?.name}
                      </h4>
                      {(item.selectedColor || item.selectedSize) && (
                        <div className="flex gap-2 mt-1 text-sm text-muted-foreground">
                          {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="font-semibold">₦{(item.product?.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  {index < order.items.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  ₦
                  {order.items
                    ?.reduce((sum: number, item: any) => sum + (item.product?.price * item.quantity), 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">₦5.99</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">
                  ₦
                  {(
                    order.items?.reduce((sum: number, item: any) => sum + (item.product?.price * item.quantity), 0) * 0.1
                  ).toFixed(2)}
                </span>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-bold">₦{(order.totalAmount || order.total || 0).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          {order.status === 'pending' && (
            <Button 
                variant="destructive" 
                className="w-full" 
                onClick={handleCancelOrder}
            >
                <Ban className="mr-2 h-4 w-4" />
                Cancel Order
            </Button>
          )}
          {order.status === 'delivered' && (
            <>
              <Button className="w-full">Leave a Review</Button>
              <Button variant="outline" className="w-full">
                Reorder
              </Button>
            </>
          )}
          {order.status === 'shipped' && (
            <Button className="w-full" onClick={() => setIsTrackingOpen(true)}>
                <Truck className="mr-2 h-4 w-4" />
                Track Package
            </Button>
          )}
          <Button variant="outline" className="w-full" onClick={() => onNavigate('home')}>
            Continue Shopping
          </Button>
        </div>

        {/* Tracking Dialog */}
        <Dialog open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Live Tracking</DialogTitle>
                    <DialogDescription>
                        Real-time updates for your shipment.
                    </DialogDescription>
                </DialogHeader>
                <div className="pt-6 space-y-8">
                    {getTrackingTimeline().map((step, i) => (
                        <div key={i} className="flex gap-4 relative">
                            {i < 3 && (
                                <div className={`absolute left-[11px] top-6 bottom-[-24px] w-0.5 ${step.completed ? 'bg-primary' : 'bg-muted'}`} />
                            )}
                            <div className={`z-10 w-6 h-6 rounded-full border-4 border-background flex items-center justify-center ${step.completed ? 'bg-primary' : 'bg-muted'}`}>
                                {step.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex-1 -mt-1">
                                <p className={`text-sm font-bold ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>{step.status}</p>
                                <p className="text-xs text-muted-foreground">{step.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <DialogFooter className="sm:justify-start pt-6">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}