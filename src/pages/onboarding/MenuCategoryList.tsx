import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Plus, Trash2, ChevronRight, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { loadRestaurantDraft, saveRestaurantDraft, updateDraftStep, generateId, MenuCategoryDraft } from '@/utils/onboardingStore';
import { cn } from '@/lib/utils';

const MenuCategoryList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<MenuCategoryDraft[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState<MenuCategoryDraft | null>(null);

  useEffect(() => {
    const draft = loadRestaurantDraft();
    setCategories(draft.menu);
  }, []);

  const handleSave = useCallback(() => {
    saveRestaurantDraft('menu', categories);
    updateDraftStep(4, true);
    navigate('/restaurant/onboarding/gallery');
  }, [categories, navigate]);

  const addCategory = useCallback(() => {
    if (!newCategory.name.trim()) return;
    
    const category: MenuCategoryDraft = {
      id: generateId(),
      name: newCategory.name,
      description: newCategory.description,
      items: [],
    };
    
    setCategories(prev => [...prev, category]);
    setNewCategory({ name: '', description: '' });
    setShowAddDialog(false);
  }, [newCategory]);

  const updateCategory = useCallback(() => {
    if (!editingCategory) return;
    
    setCategories(prev => prev.map(cat => 
      cat.id === editingCategory.id ? editingCategory : cat
    ));
    setEditingCategory(null);
  }, [editingCategory]);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  }, []);

  const navigateToItems = useCallback((category: MenuCategoryDraft) => {
    // Save current state before navigating
    saveRestaurantDraft('menu', categories);
    navigate(`/restaurant/onboarding/menu/${category.id}`);
  }, [categories, navigate]);

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-secondary/30 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/restaurant/onboarding/details')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <p className="text-xs text-purple font-medium">Step 3 of 6</p>
              <h1 className="text-xl font-bold text-foreground">Menu Builder</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Stats */}
        <Card className="p-4 bg-purple/5 border-purple/20 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple/20 flex items-center justify-center">
                <Utensils className="h-5 w-5 text-purple" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{categories.length} Categories</p>
                <p className="text-sm text-muted-foreground">{totalItems} menu items</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="gap-1 bg-purple hover:bg-purple/90"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </Card>

        {/* Categories List */}
        {categories.map((category, index) => (
          <Card
            key={category.id}
            className="p-4 animate-slide-up cursor-pointer hover:border-purple/30 transition-all"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="flex-1"
                onClick={() => navigateToItems(category)}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{category.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {category.items.length} items
                  </span>
                </div>
                {category.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{category.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); setEditingCategory(category); }}
                  className="h-8 w-8"
                >
                  <span className="text-xs">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); deleteCategory(category.id); }}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <ChevronRight 
                  className="h-5 w-5 text-muted-foreground"
                  onClick={() => navigateToItems(category)}
                />
              </div>
            </div>
          </Card>
        ))}

        {categories.length === 0 && (
          <Card className="p-8 text-center animate-slide-up">
            <Utensils className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">No categories yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add categories to organize your menu
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </Card>
        )}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Name</label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Starters, Mains, Desserts"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                placeholder="A brief description"
                className="h-12 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={addCategory} className="bg-purple hover:bg-purple/90">Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category Name</label>
                <Input
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
            <Button onClick={updateCategory} className="bg-purple hover:bg-purple/90">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50">
        <Button
          onClick={handleSave}
          disabled={totalItems === 0}
          className="w-full h-12 bg-gradient-to-r from-purple to-neon-pink text-white font-medium rounded-xl disabled:opacity-50"
        >
          Continue to Gallery
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
        {totalItems === 0 && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            Add at least one menu item to continue
          </p>
        )}
      </div>
    </div>
  );
};

export default MenuCategoryList;
