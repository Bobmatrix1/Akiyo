import { useState } from 'react';
import { MobileHeader } from '../components/MobileHeader';
import { BottomNav } from '../components/BottomNav';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from '../components/ui/dialog';
import { MapPin, Plus, Trash2, Edit2 } from 'lucide-react';
import { mockAddresses as initialAddresses } from '../data/mock-data';
import type { Page } from '../App';
import { toast } from 'sonner';

interface AddressesProps {
  onNavigate: (page: Page) => void;
  onBack: () => void;
  cartItemCount: number;
}

export function Addresses({ onNavigate, onBack, cartItemCount }: AddressesProps) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
      name: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Nigeria'
  });

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    toast.success("Address deleted");
  };

  const handleAddAddress = (e: React.FormEvent) => {
      e.preventDefault();
      const id = (addresses.length + 1).toString();
      setAddresses(prev => [...prev, { ...newAddress, id, isDefault: prev.length === 0 }]);
      setNewAddress({
          name: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Nigeria'
      });
      setIsDialogOpen(false);
      toast.success("Address added successfully");
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <MobileHeader 
        onNavigate={onNavigate} 
        onBack={onBack}
        cartItemCount={cartItemCount} 
        showSearch={false} 
        showBackButton={true} 
      />

      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Saved Addresses</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
                <DialogDescription>Enter the delivery details below.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAddress} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                            id="name" 
                            value={newAddress.name} 
                            onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                            placeholder="John Doe" 
                            required 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                            id="phone" 
                            value={newAddress.phone} 
                            onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                            placeholder="+234..." 
                            required 
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input 
                        id="street" 
                        value={newAddress.street} 
                        onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                        placeholder="123 Main St" 
                        required 
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input 
                            id="city" 
                            value={newAddress.city} 
                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                            placeholder="Lagos" 
                            required 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input 
                            id="state" 
                            value={newAddress.state} 
                            onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                            placeholder="Lagos State" 
                            required 
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="zipCode">Zip Code</Label>
                        <Input 
                            id="zipCode" 
                            value={newAddress.zipCode} 
                            onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})}
                            placeholder="100001" 
                            required 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input 
                            id="country" 
                            value={newAddress.country} 
                            onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                            required 
                        />
                    </div>
                </div>
                <DialogFooter className="pt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save Address</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="bg-accent p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{address.name}</span>
                      {address.isDefault && (
                        <Badge variant="secondary" className="text-[10px] h-4">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{address.street}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{address.phone}</p>
                    
                    <div className="flex gap-4 mt-4">
                      <button className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                        <Edit2 className="h-3 w-3" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(address.id)}
                        className="text-sm font-medium text-destructive hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav currentPage="profile" onNavigate={onNavigate} cartItemCount={cartItemCount} />
    </div>
  );
}
