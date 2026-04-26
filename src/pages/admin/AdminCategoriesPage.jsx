import React, { useState, useEffect } from 'react';
import { categoryApi } from '@/utils/api/categoryApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Tag, 
  AlertCircle,
  Hash
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "@/lib/schemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpenState] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: ""
    }
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenDialog = (category = null) => {
    setCurrentCategory(category);
    if (category) {
      form.reset({ name: category.name });
    } else {
      form.reset({ name: "" });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (currentCategory) {
        await categoryApi.updateCategory(currentCategory.id, data);
        toast.success("Category updated");
      } else {
        await categoryApi.createCategory(data);
        toast.success("New category added");
      }
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpenState(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await categoryApi.deleteCategory(categoryToDelete.id);
      toast.success("Category removed");
      setIsDeleteDialogOpenState(false);
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category. Ensure no events are using it.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Event Categories</h1>
          <p className="text-slate-500 font-medium">Define taxonomies to help users find relevant events.</p>
        </div>
        <Button className="font-bold gap-2 px-6 shadow-lg shadow-primary/20 h-12 rounded-xl" onClick={() => handleOpenDialog()}>
          <Plus className="w-5 h-5" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
           <div className="md:col-span-2 flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
           </div>
        ) : categories.length === 0 ? (
           <div className="md:col-span-2 text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Tag className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No categories created yet.</p>
           </div>
        ) : categories.map((cat) => (
          <Card key={cat.id} className="group border-2 hover:border-primary/20 transition-all rounded-3xl overflow-hidden relative">
            <CardContent className="p-6 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="bg-slate-50 p-3 rounded-2xl group-hover:bg-primary/10 transition-colors">
                     <Hash className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                  </div>
                  <div>
                     <h3 className="font-bold text-slate-900">{cat.name}</h3>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ref ID: {cat.id}</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => handleOpenDialog(cat)}>
                     <Edit2 className="w-4 h-4 text-slate-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-red-500 hover:bg-red-50" onClick={() => confirmDelete(cat)}>
                     <Trash2 className="w-4 h-4" />
                  </Button>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{currentCategory ? "Edit Category" : "New Category"}</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">Categories help organize events into logical groups.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Category Name</FormLabel>
                    <FormControl>
                       <Input placeholder="e.g. Artificial Intelligence" className="h-12 border-2 rounded-xl font-bold" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" className="w-full font-bold shadow-lg shadow-primary/20 h-12 rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : currentCategory ? "Update Category" : "Save Category"}
                </Button>
                <Button type="button" variant="ghost" className="font-bold text-slate-400" onClick={() => setIsDialogOpen(false)}>Discard</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpenState}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black flex items-center gap-2 text-red-600">
               <AlertCircle className="w-6 h-6" /> Warning
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-600 pt-2">
              Are you sure you want to delete the <strong>{categoryToDelete?.name}</strong> category? This may affect events currently associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="font-bold border-2 rounded-xl">Keep Category</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 font-bold rounded-xl px-8 h-11">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
