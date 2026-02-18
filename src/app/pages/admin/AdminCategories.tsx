import { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Plus, Edit, Trash2, Loader2, ArrowLeft, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import type { Page } from '../../App';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../../services/db';
import { uploadToCloudinary } from '../../../lib/cloudinary';

interface AdminCategoriesProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onBack?: () => void;
}

export function AdminCategories({ onNavigate, onLogout, onBack }: AdminCategoriesProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', image: '', icon: 'ShoppingBag' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
      fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
        const data = await getCategories();
        setCategories(data);
    } catch (error) {
        toast.error("Failed to load categories");
    } finally {
        setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setSelectedFile(e.target.files[0]);
      }
  };

  const handleSaveCategory = async () => {
    if (!formData.name) return;
    setSaving(true);
    try {
        let imageUrl = formData.image;
        if (selectedFile) {
            imageUrl = await uploadToCloudinary(selectedFile);
        }

        const dataToSave = { ...formData, image: imageUrl };

        if (editingId) {
            await updateCategory(editingId, dataToSave);
            toast.success('Category updated');
        } else {
            await createCategory(dataToSave);
            toast.success('Category created');
        }
        setIsDialogOpen(false);
        setFormData({ name: '', image: '', icon: 'ShoppingBag' });
        setSelectedFile(null);
        setEditingId(null);
        fetchCategories();
    } catch (error) {
        toast.error("Failed to save category");
    } finally {
        setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
      if (confirm("Delete this category?")) {
          try {
              await deleteCategory(id);
              toast.success("Category deleted");
              fetchCategories();
          } catch (error) {
              toast.error("Failed to delete category");
          }
      }
  };

  const handleEdit = (cat: any) => {
      setEditingId(cat.id);
      setFormData({ name: cat.name, image: cat.image, icon: cat.icon || 'ShoppingBag' });
      setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar currentPage="admin-categories" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="p-6 pl-16 lg:pl-6 flex items-center gap-4">
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Categories</h1>
                <p className="text-sm text-muted-foreground">Manage product categories</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingId(null); setFormData({name:'', image:'', icon:'ShoppingBag'}); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                    <DialogDescription>Create or update a product category</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input 
                        id="categoryName" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter category name" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoryImage">Category Image</Label>
                      <div className="grid gap-2">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                          />
                          <p className="text-xs text-muted-foreground text-center">OR</p>
                          <Input 
                            id="categoryImage" 
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                            placeholder="https://example.com/image.jpg" 
                          />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveCategory} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingId ? 'Update' : 'Add'} Category
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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

          {loading ? (
              <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">{category.name}</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(category)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </main>
      </div>
    </div>
  );
}
