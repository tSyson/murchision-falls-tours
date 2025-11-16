import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TourPackage {
  id: string;
  name: string;
  description: string | null;
  price_per_person: number;
  is_active: boolean;
  display_order: number;
}

export const TourPackagesManager = () => {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_per_person: "",
    display_order: "0",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("tour_packages")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tour packages.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const packageData = {
      name: formData.name,
      description: formData.description || null,
      price_per_person: parseFloat(formData.price_per_person),
      display_order: parseInt(formData.display_order),
    };

    try {
      if (editingPackage) {
        const { error } = await supabase
          .from("tour_packages")
          .update(packageData)
          .eq("id", editingPackage.id);

        if (error) throw error;
        toast({ title: "Package Updated", description: "Tour package updated successfully." });
      } else {
        const { error } = await supabase
          .from("tour_packages")
          .insert([packageData]);

        if (error) throw error;
        toast({ title: "Package Created", description: "Tour package created successfully." });
      }

      setIsDialogOpen(false);
      setEditingPackage(null);
      setFormData({ name: "", description: "", price_per_person: "", display_order: "0" });
      loadPackages();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save tour package.",
      });
    }
  };

  const toggleActive = async (pkg: TourPackage) => {
    try {
      const { error } = await supabase
        .from("tour_packages")
        .update({ is_active: !pkg.is_active })
        .eq("id", pkg.id);

      if (error) throw error;
      toast({ title: "Status Updated", description: `Package ${pkg.is_active ? 'hidden' : 'activated'}.` });
      loadPackages();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update package status.",
      });
    }
  };

  const deletePackage = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tour_packages")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Package Deleted", description: "Tour package removed successfully." });
      loadPackages();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete package.",
      });
    }
  };

  const openEditDialog = (pkg: TourPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      price_per_person: pkg.price_per_person.toString(),
      display_order: pkg.display_order.toString(),
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingPackage(null);
    setFormData({ name: "", description: "", price_per_person: "", display_order: "0" });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tour Packages & Pricing</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPackage ? "Edit" : "Create"} Tour Package</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Package Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="price">Price Per Person (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_per_person}
                  onChange={(e) => setFormData({ ...formData, price_per_person: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingPackage ? "Update" : "Create"} Package
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {packages.map((pkg) => (
            <Card key={pkg.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{pkg.name}</h3>
                    <Badge variant={pkg.is_active ? "default" : "secondary"}>
                      {pkg.is_active ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                  {pkg.description && (
                    <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                  )}
                  <p className="text-lg font-bold text-primary mt-2">
                    ${pkg.price_per_person} per person
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(pkg)}
                  >
                    {pkg.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(pkg)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Package</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this package? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deletePackage(pkg.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {packages.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No tour packages yet.</p>
        )}
      </CardContent>
    </Card>
  );
};
