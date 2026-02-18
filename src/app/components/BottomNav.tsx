import { Home, Search, ShoppingCart, Package, User } from 'lucide-react';
import { Badge } from './ui/badge';
import type { Page } from '../App';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  cartItemCount?: number;
}

export function BottomNav({ currentPage, onNavigate, cartItemCount = 0 }: BottomNavProps) {
  const navItems = [
    { id: 'home' as Page, label: 'Home', icon: Home },
    { id: 'products' as Page, label: 'Search', icon: Search },
    { id: 'cart' as Page, label: 'Cart', icon: ShoppingCart, badge: cartItemCount },
    { id: 'orders' as Page, label: 'Orders', icon: Package },
    { id: 'profile' as Page, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 py-3 px-4 flex-1 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
