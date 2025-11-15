import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ContentEditorProps {
  section: string;
  title: string;
  fields: Array<{
    name: string;
    label: string;
    type: "text" | "textarea";
  }>;
}

export const ContentEditor = ({ section, title, fields }: ContentEditorProps) => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadContent();
  }, [section]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("content")
        .eq("section", section)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setContent(data.content as Record<string, string>);
      }
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("site_content")
        .upsert({
          section,
          content,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "section",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content updated successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update content.",
      });
    } finally {
      setIsSaving(false);
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
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            {field.type === "textarea" ? (
              <Textarea
                id={field.name}
                value={content[field.name] || ""}
                onChange={(e) =>
                  setContent({ ...content, [field.name]: e.target.value })
                }
                rows={3}
              />
            ) : (
              <Input
                id={field.name}
                value={content[field.name] || ""}
                onChange={(e) =>
                  setContent({ ...content, [field.name]: e.target.value })
                }
              />
            )}
          </div>
        ))}
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
};