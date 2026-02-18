import { MobileHeader } from '../components/MobileHeader';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import type { CartItem } from '../data/mock-data';
import type { Page } from '../App';

interface CartProps {
  items: CartItem[];
  onNavigate: (page: Page) => void;
  onBack: () => void;
  onUpdateQuantity: (productId: string, quantity: number, selectedColor?: string, selectedSize?: string) => void;
  onRemove: (productId: string, selectedColor?: string, selectedSize?: string) => void;
}

export function Cart({ items, onNavigate, onBack, onUpdateQuantity, onRemove }: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-0">
        <MobileHeader onNavigate={onNavigate} cartItemCount={0} showSearch={false} />
        <div className="flex flex-col items-center justify-center p-8 min-h-[calc(100vh-200px)]">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6 text-center">
            Add some products to get started
          </p>
          <Button onClick={() => onNavigate('home')}>Start Shopping</Button>
        </div>
        <BottomNav currentPage="cart" onNavigate={onNavigate} cartItemCount={0} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <MobileHeader 
        onNavigate={onNavigate} 
        onBack={onBack}
        cartItemCount={items.length} 
        showSearch={false} 
        showBackButton={true} 
      />

      <div className="max-w-6xl mx-auto p-4 lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4 mb-6 lg:mb-0">
          <h1 className="text-2xl font-semibold mb-4">Shopping Cart ({items.length} items)</h1>

          {items.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div
                    className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden cursor-pointer"
                    onClick={() => onNavigate('product-details', item.product.id)}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-medium line-clamp-2 cursor-pointer hover:text-primary"
                      onClick={() => onNavigate('product-details', item.product.id)}
                    >
                      {item.product.name}
                    </h3>

                    {(item.selectedColor || item.selectedSize) && (
                      <div className="flex gap-2 mt-1 text-sm text-muted-foreground">
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.product.id,
                              Math.max(1, item.quantity - 1),
                              item.selectedColor,
                              item.selectedSize
                            )
                          }
                          className="p-1.5 hover:bg-accent"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.product.id,
                              item.quantity + 1,
                              item.selectedColor,
                              item.selectedSize
                            )
                          }
                          className="p-1.5 hover:bg-accent"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          ₦{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() =>
                            onRemove(item.product.id, item.selectedColor, item.selectedSize)
                          }
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₦{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : `₦${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="font-medium">₦{tax.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold">₦{total.toFixed(2)}</span>
              </div>

              {shipping > 0 && (
                <p className="text-xs text-muted-foreground">
                  Add ₦{(50 - subtotal).toFixed(2)} more to get free shipping!
                </p>
              )}

              <div className="space-y-2">
                <Input placeholder="Enter promo code" />
                <Button variant="outline" className="w-full">
                  Apply
                </Button>
              </div>

              <Button onClick={() => onNavigate('checkout')} className="w-full" size="lg">
                Proceed to Checkout
              </Button>

              <Button
                variant="ghost"
                onClick={() => onNavigate('home')}
                className="w-full"
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNav currentPage="cart" onNavigate={onNavigate} cartItemCount={items.length} />
    </div>
  );
}
