import { useState, useEffect } from 'react';
import { MobileHeader } from '../components/MobileHeader';
import { BottomNav } from '../components/BottomNav';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Heart, ShoppingCart, Star, Loader2, Trash2 } from 'lucide-react';
import { getWishlist, getProducts, toggleWishlist } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { type Product } from '../data/mock-data';
import type { Page } from '../App';
import { toast } from 'sonner';

interface WishlistProps {
  onNavigate: (page: Page, productId?: string) => void;
  onBack: () => void;
  cartItemCount: number;
}

export function Wishlist({ onNavigate, onBack, cartItemCount }: WishlistProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useCart();

  const fetchWishlistProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const wishlistIds = await getWishlist(user.uid);
      const allProducts = await getProducts();
      const wishlistProducts = allProducts.filter(p => wishlistIds.includes(p.id));
      setProducts(wishlistProducts);
    } catch (error) {
      console.error("Error fetching wishlist products:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistProducts();
  }, [user]);

  const handleRemove = async (productId: string) => {
    if (!user) return;
    try {
      await toggleWishlist(user.uid, productId, false);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <MobileHeader 
        onNavigate={onNavigate} 
        onBack={onBack}
        cartItemCount={cartItemCount} 
        showSearch={false} 
        showBackButton={true} 
      />

      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">My Wishlist</h1>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-6">Your wishlist is empty</p>
            <Button onClick={() => onNavigate('home')}>Start Shopping</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex gap-4 p-4">
                    <div 
                      className="w-24 h-24 flex-shrink-0 cursor-pointer"
                      onClick={() => onNavigate('product-details', product.id)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 
                          className="font-medium line-clamp-2 cursor-pointer hover:text-primary"
                          onClick={() => onNavigate('product-details', product.id)}
                        >
                          {product.name}
                        </h3>
                        <button 
                          onClick={() => handleRemove(product.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-1 mb-2">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">
                          {product.rating} ({product.reviewCount})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-bold">₦{product.price}</span>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            addToCart(product);
                            toast.success("Added to cart");
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav currentPage="profile" onNavigate={onNavigate} cartItemCount={cartItemCount} />
    </div>
  );
}
