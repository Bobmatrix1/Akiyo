
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import type { Product, CartItem } from "../app/data/mock-data"; // We'll keep using the type definition from mock-data for now

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => Promise<void>;
  removeFromCart: (productId: string, selectedColor?: string, selectedSize?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string, selectedSize?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from LocalStorage on mount (only if no user logic has run yet)
  useEffect(() => {
    if (!loading && !user && !isInitialized) {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
          setItems(JSON.parse(storedCart));
        }
        setIsInitialized(true);
    }
  }, [loading, user, isInitialized]);

  // Sync with Firestore when user logs in, or clear when logging out
  useEffect(() => {
    const syncCart = async () => {
      if (loading) return;

      if (user) {
        // User logged in: Fetch from Firestore
        try {
            const cartRef = doc(db, "carts", user.uid);
            const cartSnap = await getDoc(cartRef);
            
            if (cartSnap.exists()) {
            // If user has a saved cart, use it (overwriting local guest cart)
            // Ideally we could ask to merge, but for now we prioritize the saved account state
            setItems(cartSnap.data().items || []);
            } else if (items.length > 0) {
                // User has no saved cart, but has local items (guest cart) -> Save to Firestore
                await setDoc(cartRef, { items });
            }
        } catch (error) {
            console.error("Error syncing cart:", error);
        }
      } else if (isInitialized) {
          // User logged out (user is null, but we were previously initialized)
          // Clear the cart to prevent data leak
          setItems([]);
          localStorage.removeItem("cart");
      }
      
      setIsInitialized(true);
    };
    syncCart();
  }, [user, loading]);

  // Persist to LocalStorage and Firestore (if user) whenever items change
  useEffect(() => {
    // Don't save empty state if we haven't initialized yet
    if (!isInitialized && items.length === 0) return;

    localStorage.setItem("cart", JSON.stringify(items));
    if (user) {
      const saveToFirestore = async () => {
        try {
          // Firestore does not support 'undefined' values. 
          // We must sanitize the data by removing undefined keys or converting them to null.
          const sanitizedItems = items.map(item => ({
              ...item,
              selectedColor: item.selectedColor || null,
              selectedSize: item.selectedSize || null
          }));
          await setDoc(doc(db, "carts", user.uid), { items: sanitizedItems });
        } catch (err) {
            console.error("Failed to sync cart to Firestore", err);
        }
      };
      saveToFirestore();
    }
  }, [items, user, isInitialized]);

  const addToCart = async (product: Product, quantity: number = 1, selectedColor?: string, selectedSize?: string) => {
    setItems((prev) => {
      const existingItem = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
      );

      if (existingItem) {
        return prev.map((item) =>
          item === existingItem
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedColor, selectedSize }];
    });
  };

  const removeFromCart = async (productId: string, selectedColor?: string, selectedSize?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize
          )
      )
    );
  };

  const updateQuantity = async (productId: string, quantity: number, selectedColor?: string, selectedSize?: string) => {
     if (quantity <= 0) {
         await removeFromCart(productId, selectedColor, selectedSize);
         return;
     }

    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = async () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
