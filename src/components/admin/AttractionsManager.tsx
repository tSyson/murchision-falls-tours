import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";

interface Attraction {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

export const AttractionsManager = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAttractions();
  }, []);

  const loadAttractions = async () => {
    try {
      const { data, error } = await supabase
        .from("attractions")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setAttractions(data || []);
    } catch (error) {
      console.error("Error loading attractions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, attractionId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${attractionId}-${Date.now()}.${fileExt}`;
      const filePath = `attractions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("site-images")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("attractions")
        .update({ image_url: publicUrl })
        .eq("id", attractionId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });

      loadAttractions();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (formData: Partial<Attraction>) => {
    try {
      if (editingAttraction?.id) {
        const { error } = await supabase
          .from("attractions")
          .update(formData)
          .eq("id", editingAttraction.id);

        if (error) throw error;
      } else {
        const insertData = {
          title: formData.title || "",
          description: formData.description || "",
          display_order: formData.display_order || 0,
        };
        
        const { error } = await supabase
          .from("attractions")
          .insert([insertData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Attraction saved successfully!",
      });

      setIsDialogOpen(false);
      setEditingAttraction(null);
      loadAttractions();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save attraction.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attraction?")) return;

    try {
      const { error } = await supabase
        .from("attractions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attraction deleted successfully!",
      });

      loadAttractions();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete attraction.",
      });
    }
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
        <CardTitle>Manage Attractions</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAttraction(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Attraction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAttraction ? "Edit Attraction" : "Add New Attraction"}
              </DialogTitle>
            </DialogHeader>
            <AttractionForm
              attraction={editingAttraction}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingAttraction(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {attractions.map((attraction) => (
            <Card key={attraction.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{attraction.title}</h3>
                    <p className="text-muted-foreground mt-1">{attraction.description}</p>
                    {attraction.image_url && (
                      <img
                        src={attraction.image_url}
                        alt={attraction.title}
                        className="mt-3 w-32 h-32 object-cover rounded"
                      />
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <Label htmlFor={`image-${attraction.id}`} className="cursor-pointer">
                        <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Upload className="w-4 h-4" />
                          {isUploading ? "Uploading..." : "Upload Image"}
                        </div>
                      </Label>
                      <Input
                        id={`image-${attraction.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, attraction.id)}
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingAttraction(attraction);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(attraction.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AttractionForm = ({
  attraction,
  onSave,
  onCancel,
}: {
  attraction: Attraction | null;
  onSave: (data: Partial<Attraction>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: attraction?.title || "",
    description: attraction?.description || "",
    display_order: attraction?.display_order || 0,
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>
      <div>
        <Label htmlFor="display_order">Display Order</Label>
        <Input
          id="display_order"
          type="number"
          value={formData.display_order}
          onChange={(e) =>
            setFormData({ ...formData, display_order: parseInt(e.target.value) })
          }
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={() => onSave(formData)}>Save</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};