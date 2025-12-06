import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Image, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { loadRestaurantDraft, saveRestaurantDraft, generateId, MenuItemDraft, MenuCategoryDraft } from '@/utils/onboardingStore';
import { cn } from '@/lib/utils';

const MENU_TAGS = ['Spicy 🌶️', 'Veggie', 'Vegan', 'Gluten-Free', "Chef's Pick", 'Popular', 'New'];

const MenuItemEditor = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [category, setCategory] = useState<MenuCategoryDraft | null>(null);
  const [allCategories, setAllCategories] = useState<MenuCategoryDraft[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemDraft | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItemDraft>>({
    name: '',
    description: '',
    price: 0,
    tags: [],
    image: '',
  });

  useEffect(() => {
    const draft = loadRestaurantDraft();
    setAllCategories(draft.menu);
    const cat = draft.menu.find(c => c.id === categoryId);
    if (cat) {
      setCategory(cat);
    } else {
      navigate('/restaurant/onboarding/menu');
    }
  }, [categoryId, navigate]);

  const saveChanges = useCallback(() => {
    if (!category) return;
    
    const updatedCategories = allCategories.map(cat => 
      cat.id === category.id ? category : cat
    );
    saveRestaurantDraft('menu', updatedCategories);
  }, [category, allCategories]);

  const addItem = useCallback(() => {
    if (!newItem.name?.trim() || !category) return;
    
    const item: MenuItemDraft = {
      id: generateId(),
      name: newItem.name,
      description: newItem.description || '',
      price: newItem.price || 0,
      category: category.id,
      tags: newItem.tags || [],
      image: newItem.image,
    };
    
    setCategory(prev => prev ? { ...prev, items: [...prev.items, item] } : null);
    setNewItem({ name: '', description: '', price: 0, tags: [], image: '' });
    setShowAddDialog(false);
  }, [newItem, category]);

  const updateItem = useCallback(() => {
    if (!editingItem || !category) return;
    
    setCategory(prev => prev ? {
      ...prev,
      items: prev.items.map(item => item.id === editingItem.id ? editingItem : item)
    } : null);
    setEditingItem(null);
  }, [editingItem, category]);

  const deleteItem = useCallback((id: string) => {
    setCategory(prev => prev ? {
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    } : null);
  }, []);

  const toggleTag = (tag: string, isEditing: boolean) => {
    if (isEditing && editingItem) {
      setEditingItem(prev => prev ? {
        ...prev,
        tags: prev.tags.includes(tag) 
          ? prev.tags.filter(t => t !== tag) 
          : [...prev.tags, tag]
      } : null);
    } else {
      setNewItem(prev => ({
        ...prev,
        tags: (prev.tags || []).includes(tag)
          ? (prev.tags || []).filter(t => t !== tag)
          : [...(prev.tags || []), tag]
      }));
    }
  };

  const handleBack = useCallback(() => {
    saveChanges();
    navigate('/restaurant/onboarding/menu');
  }, [saveChanges, navigate]);

  if (!category) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/30 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <p className="text-xs text-purple font-medium">Menu Builder</p>
              <h1 className="text-xl font-bold text-foreground">{category.name}</h1>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="gap-1 bg-purple hover:bg-purple/90"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Items List */}
        {category.items.map((item, index) => (
          <Card
            key={item.id}
            className="p-4 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex gap-3">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
                  <Image className="h-6 w-6 text-muted-foreground/30" />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-purple font-medium">£{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingItem(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteItem(item.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                )}
                
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}

        {category.items.length === 0 && (
          <Card className="p-8 text-center animate-slide-up">
            <Image className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">No items yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add dishes to this category
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Menu Item
            </Button>
          </Card>
        )}
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Item Name *</label>
              <Input
                value={newItem.name || ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Grilled Salmon"
                className="h-12 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newItem.description || ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the dish..."
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Price (£) *</label>
              <Input
                type="number"
                step="0.01"
                value={newItem.price || ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="12.99"
                className="h-12 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {MENU_TAGS.map(tag => (
                  <Badge
                    key={tag}
                    variant={(newItem.tags || []).includes(tag) ? 'default' : 'outline'}
                    className={cn(
                      "cursor-pointer transition-all",
                      (newItem.tags || []).includes(tag) && "bg-purple"
                    )}
                    onClick={() => toggleTag(tag, false)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={addItem} className="bg-purple hover:bg-purple/90">Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Name</label>
                <Input
                  value={editingItem.name}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="h-12 rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (£)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                  className="h-12 rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {MENU_TAGS.map(tag => (
                    <Badge
                      key={tag}
                      variant={editingItem.tags.includes(tag) ? 'default' : 'outline'}
                      className={cn(
                        "cursor-pointer transition-all",
                        editingItem.tags.includes(tag) && "bg-purple"
                      )}
                      onClick={() => toggleTag(tag, true)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
            <Button onClick={updateItem} className="bg-purple hover:bg-purple/90">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuItemEditor;
