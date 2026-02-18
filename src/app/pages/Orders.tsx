import { useState, useEffect } from 'react';
import { MobileHeader } from '../components/MobileHeader';
import { BottomNav } from '../components/BottomNav';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Package, ChevronRight, Loader2 } from 'lucide-react';
import type { Page } from '../App';
import { getUserOrders, type Order as DBOrder } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

interface OrdersProps {
  orders: any[]; // Ignored now, kept for signature compatibility
  onNavigate: (page: Page, productId?: string, orderId?: string) => void;
  onBack: () => void;
  cartItemCount: number;
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

export function Orders({ onNavigate, cartItemCount }: OrdersProps) {
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const data = await getUserOrders(user.uid);
          setOrders(data);
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const filterOrders = (status?: DBOrder['status']) => {
    if (!status) return orders;
    return orders.filter(order => order.status === status);
  };

  const renderOrder = (order: DBOrder) => (
    <Card
      key={order.id}
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onNavigate('order-details', undefined, order.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-sm text-muted-foreground">
              {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Recent'}
            </p>
          </div>
          <Badge className={statusColors[order.status] || 'bg-gray-500'}>
            {statusLabels[order.status] || order.status}
          </Badge>
        </div>

        <div className="flex gap-3 mb-3">
          {order.items && order.items.slice(0, 3).map((item, index) => (
            <img
              key={index}
              src={item.product.image}
              alt={item.product.name}
              className="w-16 h-16 object-cover rounded-md"
            />
          ))}
          {order.items && order.items.length > 3 && (
            <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-sm font-medium">
              +{order.items.length - 3}
            </div>
          )}
        </div>

                  <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm text-muted-foreground">

                      {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}

                    </p>

                    <p className="font-semibold">₦{order.totalAmount?.toFixed(2)}</p>

                  </div>

                  <Button variant="ghost" size="sm">

        
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
     return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
     );
  }

  if (!user) {
      return (
          <div className="min-h-screen bg-background pb-20 lg:pb-0">
            <MobileHeader onNavigate={onNavigate} cartItemCount={cartItemCount} showSearch={false} />
            <div className="flex flex-col items-center justify-center p-8 min-h-[calc(100vh-200px)]">
              <Package className="h-24 w-24 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Please Log In</h2>
              <p className="text-muted-foreground mb-6 text-center">
                You need to be logged in to view your orders.
              </p>
              <Button onClick={() => onNavigate('login')}>Log In</Button>
            </div>
            <BottomNav currentPage="orders" onNavigate={onNavigate} cartItemCount={cartItemCount} />
          </div>
      );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-0">
        <MobileHeader onNavigate={onNavigate} cartItemCount={cartItemCount} showSearch={false} />
        <div className="flex flex-col items-center justify-center p-8 min-h-[calc(100vh-200px)]">
          <Package className="h-24 w-24 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6 text-center">
            Start shopping and your orders will appear here
          </p>
          <Button onClick={() => onNavigate('home')}>Start Shopping</Button>
        </div>
        <BottomNav currentPage="orders" onNavigate={onNavigate} cartItemCount={cartItemCount} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <MobileHeader onNavigate={onNavigate} cartItemCount={cartItemCount} showSearch={false} showBackButton={true} />

      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-5 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="processing">Active</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Done</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filterOrders().map(renderOrder)}
          </TabsContent>

          <TabsContent value="processing" className="space-y-4">
            {filterOrders('processing').length > 0 ? (
              filterOrders('processing').map(renderOrder)
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active orders</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="shipped" className="space-y-4">
            {filterOrders('shipped').length > 0 ? (
              filterOrders('shipped').map(renderOrder)
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No shipped orders</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="delivered" className="space-y-4">
            {filterOrders('delivered').length > 0 ? (
              filterOrders('delivered').map(renderOrder)
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No delivered orders</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {filterOrders('cancelled').length > 0 ? (
              filterOrders('cancelled').map(renderOrder)
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No cancelled orders</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav currentPage="orders" onNavigate={onNavigate} cartItemCount={cartItemCount} />
    </div>
  );
}
