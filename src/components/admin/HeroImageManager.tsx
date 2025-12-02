import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

export const HeroImageManager = () => {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadHeroImage();
  }, []);

  const loadHeroImage = async () => {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("content")
        .eq("section", "hero")
        .maybeSingle();

      if (error) throw error;

      if (data?.content && typeof data.content === 'object' && 'heroImage' in data.content) {
        const imageUrl = data.content.heroImage as string;
        setHeroImage(imageUrl);
        setSignedUrl(imageUrl);
      }
    } catch (error) {
      console.error("Error loading hero image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Image must be less than 10MB",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const file = formData.get("heroImage") as File;

      if (!file) {
        toast({
          variant: "destructive",
          title: "No file selected",
          description: "Please select an image to upload.",
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(filePath);

      const { data: { user } } = await supabase.auth.getUser();

      const { data: existingContent } = await supabase
        .from("site_content")
        .select("content")
        .eq("section", "hero")
        .maybeSingle();

      const content = (existingContent?.content as Record<string, unknown>) || {};

      const { error } = await supabase
        .from("site_content")
        .upsert({
          section: "hero",
          content: { ...content, heroImage: publicUrl },
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "section",
        });

      if (error) throw error;

      setHeroImage(publicUrl);
      setSignedUrl(publicUrl);
      setPreview(null);
      toast({
        title: "Success",
        description: "Hero image updated successfully!",
      });
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
      <CardHeader>
        <CardTitle>Hero Section Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(signedUrl || preview) && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <img
              src={preview || signedUrl || ""}
              alt="Hero"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <Label htmlFor="heroImage">Upload New Hero Image</Label>
            <Input
              id="heroImage"
              name="heroImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Recommended: 1920x1080px or larger. Max 10MB.
            </p>
          </div>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};