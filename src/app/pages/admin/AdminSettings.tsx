import { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Loader2, Plus, Trash2, Edit, Save, X, Image as ImageIcon, Database } from 'lucide-react';
import { toast } from 'sonner';
import type { Page } from '../../App';
import { getStoreSettings, updateStoreSettings, getBanners, createBanner, updateBanner, deleteBanner, type Banner } from '../../../services/db';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import { seedDatabase } from '../../../services/seed';

interface AdminSettingsProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onBack?: () => void;
}

export function AdminSettings({ onNavigate, onLogout, onBack }: AdminSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState<Omit<Banner, 'id'>>({
    title: '',
    subtitle: '',
    image: '',
    cta: 'Shop Now',
    active: true,
    order: 0
  });

  const [settings, setSettings] = useState<any>({
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    maintenanceMode: false,
    storeStatus: true,
    emailNotifications: true
  });

  useEffect(() => {
      fetchData();
  }, []);

  const fetchData = async () => {
      setLoading(true);
      try {
          const [settingsData, bannersData] = await Promise.all([
              getStoreSettings(),
              getBanners()
          ]);
          setSettings(settingsData);
          setBanners(bannersData);
      } catch (error) {
          toast.error("Failed to load data");
      } finally {
          setLoading(false);
      }
  };

  const handleSave = async (updates: any) => {
    setSaving(true);
    try {
        const newSettings = { ...settings, ...updates };
        await updateStoreSettings(newSettings);
        setSettings(newSettings);
        toast.success('Settings saved successfully!');
    } catch (error) {
        toast.error('Failed to save settings');
    } finally {
        setSaving(false);
    }
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading image...");
    try {
        const url = await uploadToCloudinary(file);
        setBannerForm({ ...bannerForm, image: url });
        toast.success("Image uploaded", { id: toastId });
    } catch (error) {
        toast.error("Upload failed", { id: toastId });
    }
  };

  const handleAddBanner = async () => {
    if (!bannerForm.title || !bannerForm.image) {
        toast.error("Title and Image are required");
        return;
    }
    setSaving(true);
    try {
        const id = await createBanner({ ...bannerForm, order: banners.length });
        setBanners([...banners, { id, ...bannerForm }]);
        setIsAddingBanner(false);
        setBannerForm({ title: '', subtitle: '', image: '', cta: 'Shop Now', active: true, order: 0 });
        toast.success("Banner added");
    } catch (error) {
        toast.error("Failed to add banner");
    } finally {
        setSaving(false);
    }
  };

  const handleUpdateBanner = async (id: string) => {
    setSaving(true);
    try {
        await updateBanner(id, bannerForm);
        setBanners(banners.map(b => b.id === id ? { ...b, ...bannerForm } : b));
        setEditingBannerId(null);
        toast.success("Banner updated");
    } catch (error) {
        toast.error("Failed to update banner");
    } finally {
        setSaving(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
        await deleteBanner(id);
        setBanners(banners.filter(b => b.id !== id));
        toast.success("Banner deleted");
    } catch (error) {
        toast.error("Failed to delete banner");
    }
  };

  const startEditingBanner = (banner: Banner) => {
      setEditingBannerId(banner.id);
      setBannerForm({
          title: banner.title,
          subtitle: banner.subtitle,
          image: banner.image,
          cta: banner.cta,
          active: banner.active,
          order: banner.order
      });
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar currentPage="admin-settings" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="p-6 pl-16 lg:pl-6 flex items-center gap-4">
            <div>
                <h1 className="text-2xl font-semibold">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage store settings and preferences</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
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

          <Tabs defaultValue="store" className="space-y-6">
            <TabsList>
              <TabsTrigger value="store">Store Info</TabsTrigger>
              <TabsTrigger value="banners">Banners</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="admin">Admin Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="store" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input 
                        id="storeName" 
                        value={settings.storeName} 
                        onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeEmail">Store Email</Label>
                    <Input 
                        id="storeEmail" 
                        type="email" 
                        value={settings.storeEmail} 
                        onChange={(e) => setSettings({...settings, storeEmail: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storePhone">Store Phone</Label>
                    <Input 
                        id="storePhone" 
                        value={settings.storePhone} 
                        onChange={(e) => setSettings({...settings, storePhone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeAddress">Store Address</Label>
                    <Textarea 
                        id="storeAddress" 
                        value={settings.storeAddress} 
                        onChange={(e) => setSettings({...settings, storeAddress: e.target.value})}
                    />
                  </div>
                  <Button onClick={() => handleSave(settings)} disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Store Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Store Status</p>
                      <p className="text-sm text-muted-foreground">Make store visible to customers</p>
                    </div>
                    <Switch 
                        checked={settings.storeStatus} 
                        onCheckedChange={(checked) => handleSave({ storeStatus: checked })} 
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-muted-foreground">Disable customer access</p>
                    </div>
                    <Switch 
                        checked={settings.maintenanceMode} 
                        onCheckedChange={(checked) => handleSave({ maintenanceMode: checked })} 
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Send order notifications</p>
                    </div>
                    <Switch 
                        checked={settings.emailNotifications} 
                        onCheckedChange={(checked) => handleSave({ emailNotifications: checked })} 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="banners" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Main Page Banners</h2>
                <Button onClick={() => setIsAddingBanner(true)} disabled={isAddingBanner || !!editingBannerId}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Banner
                </Button>
              </div>

              {(isAddingBanner || editingBannerId) && (
                <Card className="border-primary/50 shadow-md">
                  <CardHeader>
                    <CardTitle>{editingBannerId ? 'Edit Banner' : 'New Banner'}</CardTitle>
                    <CardDescription>Banners appear in the carousel on the home page.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input 
                                placeholder="Summer Sale" 
                                value={bannerForm.title}
                                onChange={e => setBannerForm({...bannerForm, title: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Subtitle</Label>
                            <Input 
                                placeholder="Up to 50% off" 
                                value={bannerForm.subtitle}
                                onChange={e => setBannerForm({...bannerForm, subtitle: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>CTA Text</Label>
                            <Input 
                                placeholder="Shop Now" 
                                value={bannerForm.cta}
                                onChange={e => setBannerForm({...bannerForm, cta: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Display Order</Label>
                            <Input 
                                type="number" 
                                value={bannerForm.order}
                                onChange={e => setBannerForm({...bannerForm, order: parseInt(e.target.value) || 0})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Banner Image</Label>
                        <div className="flex items-center gap-4">
                            {bannerForm.image ? (
                                <div className="relative w-32 h-20 rounded border overflow-hidden">
                                    <img src={bannerForm.image} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => setBannerForm({...bannerForm, image: ''})}
                                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-32 h-20 rounded border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/50">
                                    <ImageIcon className="h-6 w-6 mb-1" />
                                    <span className="text-[10px]">No image</span>
                                </div>
                            )}
                            <div className="flex-1">
                                <Input type="file" accept="image/*" onChange={handleBannerImageUpload} />
                                <p className="text-[10px] text-muted-foreground mt-1">Recommended: 1200x400px or similar ratio.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Switch 
                            id="banner-active" 
                            checked={bannerForm.active} 
                            onCheckedChange={checked => setBannerForm({...bannerForm, active: checked})}
                        />
                        <Label htmlFor="banner-active">Active (Show on Home Page)</Label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => { setIsAddingBanner(false); setEditingBannerId(null); }}>Cancel</Button>
                        <Button onClick={() => editingBannerId ? handleUpdateBanner(editingBannerId) : handleAddBanner()} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingBannerId ? 'Update Banner' : 'Create Banner'}
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((banner) => (
                  <Card key={banner.id} className={!banner.active ? 'opacity-60 grayscale' : ''}>
                    <div className="relative aspect-[3/1] overflow-hidden rounded-t-lg">
                      <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4 text-white">
                        <h4 className="font-bold">{banner.title}</h4>
                        <p className="text-xs">{banner.subtitle}</p>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant={banner.active ? 'default' : 'secondary'}>
                            {banner.active ? 'Active' : 'Hidden'}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="text-sm font-medium">Order: {banner.order}</div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => startEditingBanner(banner)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteBanner(banner.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {banners.length === 0 && !isAddingBanner && (
                  <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium">No Banners Found</h3>
                      <p className="text-sm text-muted-foreground mb-6">Add your first banner or seed the database with defaults.</p>
                      <Button variant="outline" onClick={async () => { await seedDatabase(); fetchData(); }}>
                          <Database className="h-4 w-4 mr-2" />
                          Seed Default Banners
                      </Button>
                  </div>
              )}

              <Separator className="my-8" />
              
              <Card>
                <CardHeader>
                  <CardTitle>Bottom Promotion Banner</CardTitle>
                  <CardDescription>The large banner at the bottom of the home page (usually for newsletter or special offers).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Banner Visibility</p>
                      <p className="text-sm text-muted-foreground">Show or hide this banner on the home page</p>
                    </div>
                    <Switch 
                        checked={settings?.promoBanner?.active ?? true} 
                        onCheckedChange={(checked) => handleSave({ 
                            promoBanner: { ...(settings?.promoBanner || {}), active: checked } 
                        })} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <Label>Title</Label>
                          <Input 
                              placeholder="Join Our Newsletter"
                              value={settings?.promoBanner?.title ?? ''} 
                              onChange={(e) => setSettings({
                                  ...settings, 
                                  promoBanner: { ...(settings?.promoBanner || {}), title: e.target.value }
                              })}
                          />
                      </div>
                      <div className="space-y-2">
                          <Label>Subtitle</Label>
                          <Input 
                              placeholder="Get 10% off your first order"
                              value={settings?.promoBanner?.subtitle ?? ''} 
                              onChange={(e) => setSettings({
                                  ...settings, 
                                  promoBanner: { ...(settings?.promoBanner || {}), subtitle: e.target.value }
                              })}
                          />
                      </div>
                      <div className="space-y-2">
                          <Label>Button Text (CTA)</Label>
                          <Input 
                              placeholder="Subscribe Now"
                              value={settings?.promoBanner?.cta ?? ''} 
                              onChange={(e) => setSettings({
                                  ...settings, 
                                  promoBanner: { ...(settings?.promoBanner || {}), cta: e.target.value }
                              })}
                          />
                      </div>
                      <div className="space-y-2">
                        <Label>Banner Image</Label>
                        <div className="flex items-center gap-4">
                            {settings?.promoBanner?.image && (
                                <div className="w-16 h-16 rounded border overflow-hidden shrink-0">
                                    <img src={settings.promoBanner.image} alt="Promo" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <Input 
                                type="file" 
                                accept="image/*" 
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const toastId = toast.loading("Uploading image...");
                                    try {
                                        const url = await uploadToCloudinary(file);
                                        setSettings({
                                            ...settings, 
                                            promoBanner: { ...(settings?.promoBanner || {}), image: url }
                                        });
                                        toast.success("Image uploaded", { id: toastId });
                                    } catch (error) {
                                        toast.error("Upload failed", { id: toastId });
                                    }
                                }} 
                            />
                        </div>
                      </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave(settings)} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Promo Banner Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Credit/Debit Cards</p>
                      <p className="text-sm text-muted-foreground">Accept card payments</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Digital Wallets</p>
                      <p className="text-sm text-muted-foreground">PayPal, Apple Pay, Google Pay</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-sm text-muted-foreground">Direct bank transfer</p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">COD payments</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Standard Shipping</p>
                      <p className="text-sm text-muted-foreground">5-7 business days - ₦5.99</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Express Shipping</p>
                      <p className="text-sm text-muted-foreground">2-3 business days - ₦15.99</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Free Shipping</p>
                      <p className="text-sm text-muted-foreground">On orders over ₦50</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Name</Label>
                    <Input id="adminName" defaultValue="Admin User" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email</Label>
                    <Input id="adminEmail" type="email" defaultValue="admin@akiyo.com" />
                  </div>
                  <Button onClick={() => toast.success("Admin profile updated")}>Update Profile</Button>
                </CardContent>
              </Card>

              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-destructive">System Management</CardTitle>
                  <CardDescription>Advanced tools for store maintenance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Seed Database</p>
                      <p className="text-sm text-muted-foreground">Reset database with default banners and products.</p>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={async () => {
                            if(confirm("This will overwrite existing banners and settings with defaults. Continue?")) {
                                await seedDatabase();
                                fetchData();
                            }
                        }}
                    >
                        <Database className="h-4 w-4 mr-2" />
                        Seed DB
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}