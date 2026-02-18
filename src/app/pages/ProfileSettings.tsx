import { useState } from 'react';
import { MobileHeader } from '../components/MobileHeader';
import { BottomNav } from '../components/BottomNav';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
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
import { CreditCard, Bell, HelpCircle, Shield, ChevronRight, Loader2, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import type { Page } from '../App';

interface PaymentCard {
    id: string;
    number: string;
    expiry: string;
    type: string;
}

interface ProfileSettingsProps {
  onNavigate: (page: Page) => void;
  onBack: () => void;
  cartItemCount: number;
  type: 'payment' | 'notifications' | 'help' | 'settings';
}

export function ProfileSettings({ onNavigate, onBack, cartItemCount, type }: ProfileSettingsProps) {
  const { user } = useAuth();
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [language, setLanguage] = useState('English (US)');
  const [newCard, setNewCard] = useState({
      number: '',
      expiry: '',
      cvv: '',
      name: ''
  });

  const languages = ['English (US)', 'French', 'Spanish', 'German', 'Chinese', 'Arabic'];

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow control keys (backspace, tab, etc.) and meta keys (ctrl+c, ctrl+v)
    const isControlKey = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End', 'Escape'
    ].includes(e.key);
    const isMetaKey = e.ctrlKey || e.metaKey;
    const isNumber = /^[0-9]$/.test(e.key);

    if (!isNumber && !isControlKey && !isMetaKey) {
      e.preventDefault();
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value.replace(/[^0-9]/g, ''); // Ensure only numbers are kept
      if (v.length > 4) v = v.slice(0, 4);

      if (v.length >= 3) {
          v = `${v.slice(0, 2)}/${v.slice(2)}`;
      }
      
      setNewCard(prev => ({ ...prev, expiry: v }));
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
      setNewCard(prev => ({ ...prev, cvv: v }));
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 16);
      setNewCard(prev => ({ ...prev, number: v }));
  };

  const handleAddCard = (e: React.FormEvent) => {
      e.preventDefault();
      const id = Date.now().toString();
      // Mask the card number for display
      const last4 = newCard.number.slice(-4);
      setCards([...cards, { 
          id, 
          number: `**** **** **** ${last4}`, 
          expiry: newCard.expiry, 
          type: 'Visa' // Defaulting to Visa for mock
      }]);
      setNewCard({ number: '', expiry: '', cvv: '', name: '' });
      setIsDialogOpen(false);
      toast.success("Card added successfully");
  };

  const removeCard = (id: string) => {
      setCards(cards.filter(c => c.id !== id));
      toast.success("Card removed");
  };

  const handlePasswordReset = async () => {
      if (user?.email) {
          try {
              // In a real app, you'd use sendPasswordResetEmail(auth, user.email)
              // For now we'll simulate the success
              toast.success(`Password reset email sent to ${user.email}`);
              setIsSecurityOpen(false);
          } catch (error) {
              toast.error("Failed to send reset email");
          }
      }
  };
  
  const renderContent = () => {
    switch (type) {
      case 'payment':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Payment Methods</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Card
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Payment Card</DialogTitle>
                            <DialogDescription>Enter your card details securely below.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddCard} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="cardName">Cardholder Name</Label>
                                <Input 
                                    id="cardName" 
                                    value={newCard.name}
                                    onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                                    placeholder="JOHN DOE" 
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cardNumber">Card Number</Label>
                                <Input 
                                    id="cardNumber" 
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    autoComplete="off"
                                    value={newCard.number}
                                    onChange={handleCardNumberChange}
                                    onKeyDown={handleNumericKeyDown}
                                    placeholder="1234567891011121" 
                                    maxLength={16}
                                    required 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry">Expiry Date</Label>
                                    <Input 
                                        id="expiry" 
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="off"
                                        value={newCard.expiry}
                                        onChange={handleExpiryChange}
                                        onKeyDown={handleNumericKeyDown}
                                        placeholder="MM/YY" 
                                        maxLength={5}
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvv">CVV</Label>
                                    <Input 
                                        id="cvv" 
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="off"
                                        value={newCard.cvv}
                                        onChange={handleCVVChange}
                                        onKeyDown={handleNumericKeyDown}
                                        placeholder="123" 
                                        maxLength={3}
                                        required 
                                    />
                                </div>
                            </div>
                            <DialogFooter className="pt-4">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit">Save Card</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {cards.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                        <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No payment methods saved yet</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {cards.map(card => (
                        <Card key={card.id}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-accent p-2 rounded-lg">
                                        <CreditCard className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{card.number}</p>
                                        <p className="text-sm text-muted-foreground">Expires {card.expiry}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => removeCard(card.id)}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold mb-6">Notifications</h1>
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">Order Updates</p>
                    <p className="text-sm text-muted-foreground">Get notified about your order status</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">Promotions</p>
                    <p className="text-sm text-muted-foreground">Hear about new sales and offers</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">Account Security</p>
                    <p className="text-sm text-muted-foreground">Alerts about your account login</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'help':
        return (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold mb-6">Help & Support</h1>
            <div className="grid gap-4">
              {['FAQs', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map(item => (
                <Card key={item} className="cursor-pointer hover:bg-accent" onClick={() => toast.info(`${item} details coming soon`)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-medium">{item}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold mb-6">Settings</h1>
            <Card>
              <CardContent className="p-0">
                <Dialog open={isLanguageOpen} onOpenChange={setIsLanguageOpen}>
                    <DialogTrigger asChild>
                        <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent">
                          <div className="flex items-center gap-3">
                            <HelpCircle className="h-5 w-5" />
                            <span>Language</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{language}</span>
                        </div>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Select Language</DialogTitle>
                            <DialogDescription>Choose your preferred language for the application.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2 pt-4">
                            {languages.map(lang => (
                                <Button 
                                    key={lang} 
                                    variant={language === lang ? "default" : "ghost"}
                                    className="justify-start"
                                    onClick={() => {
                                        setLanguage(lang);
                                        setIsLanguageOpen(false);
                                        toast.success(`Language changed to ${lang}`);
                                    }}
                                >
                                    {lang}
                                </Button>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>

                <Separator />

                <Dialog open={isSecurityOpen} onOpenChange={setIsSecurityOpen}>
                    <DialogTrigger asChild>
                        <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent">
                          <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5" />
                            <span>Account Security</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Account Security</DialogTitle>
                            <DialogDescription>Manage your password and security settings.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="font-medium mb-1">Password</p>
                                <p className="text-sm text-muted-foreground mb-4">You can request a password reset email below.</p>
                                <Button className="w-full" onClick={handlePasswordReset}>
                                    Send Reset Email
                                </Button>
                            </div>
                            <div className="p-4 border rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Two-Factor Auth</p>
                                    <p className="text-sm text-muted-foreground">Secure your account</p>
                                </div>
                                <Switch />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Separator />
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent" onClick={() => onNavigate('edit-profile')}>
                   <div className="flex items-center gap-3">
                    <UserIcon className="h-5 w-5" />
                    <span>Account Info</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
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
        {renderContent()}
      </div>
      <BottomNav currentPage="profile" onNavigate={onNavigate} cartItemCount={cartItemCount} />
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
    return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
}
