import { Navigation } from "@/components/Navigation";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { AttractionsManager } from "@/components/admin/AttractionsManager";
import { BookingsManager } from "@/components/admin/BookingsManager";
import { HeroImageManager } from "@/components/admin/HeroImageManager";
import { TourPackagesManager } from "@/components/admin/TourPackagesManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";

const Admin = () => {
  return (
    <div className="min-h-screen bg-muted">
      <Navigation />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">Admin Dashboard</h1>
          </div>

          <Tabs defaultValue="packages" className="w-full">
            <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="heroImage">Hero Image</TabsTrigger>
              <TabsTrigger value="hero">Hero Text</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="attractions">Attractions</TabsTrigger>
            </TabsList>

            <TabsContent value="packages" className="mt-6">
              <TourPackagesManager />
            </TabsContent>

            <TabsContent value="bookings" className="mt-6">
              <BookingsManager />
            </TabsContent>

            <TabsContent value="hero" className="mt-6">
              <ContentEditor
                section="hero"
                title="Edit Hero Section Text"
                fields={[
                  { name: "title", label: "Main Title", type: "text" },
                  { name: "subtitle", label: "Subtitle", type: "textarea" },
                  { name: "ctaText", label: "Button Text", type: "text" },
                ]}
              />
            </TabsContent>

            <TabsContent value="heroImage" className="mt-6">
              <HeroImageManager />
            </TabsContent>

            <TabsContent value="contact" className="mt-6">
              <ContentEditor
                section="contact"
                title="Edit Contact Information"
                fields={[
                  { name: "title", label: "Section Title", type: "text" },
                  { name: "address", label: "Address", type: "text" },
                  { name: "phone", label: "Phone Number", type: "text" },
                  { name: "email", label: "Email", type: "text" },
                  { name: "hours", label: "Operating Hours", type: "text" },
                ]}
              />
            </TabsContent>

            <TabsContent value="attractions" className="mt-6">
              <AttractionsManager />
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;