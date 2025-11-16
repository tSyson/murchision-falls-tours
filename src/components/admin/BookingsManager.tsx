import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, CheckCircle, XCircle } from "lucide-react";
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

interface Booking {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  tour_package: string;
  num_guests: number;
  start_date: string;
  end_date: string;
  photo_url: string | null;
  price_per_person: number | null;
  status: string;
  created_at: string;
}

export const BookingsManager = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("tour_bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load bookings.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("tour_bookings")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      toast({
        title: "Status Updated",
        description: `Booking marked as ${status}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status.",
      });
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tour_bookings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setBookings(bookings.filter(b => b.id !== id));
      toast({
        title: "Booking Deleted",
        description: "Booking has been removed.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete booking.",
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
      <CardHeader>
        <CardTitle>Manage Bookings ({bookings.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              {booking.photo_url && (
                <img
                  src={booking.photo_url}
                  alt={booking.full_name}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-lg">{booking.full_name}</h3>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">{booking.email}</p>
                  <p className="text-muted-foreground">{booking.phone}</p>
                  <p className="font-medium text-primary">{booking.tour_package}</p>
                  <p>Guests: {booking.num_guests}</p>
                  {booking.price_per_person && (
                    <p className="font-bold text-primary">
                      ${booking.price_per_person} × {booking.num_guests} = ${(booking.price_per_person * booking.num_guests).toFixed(2)}
                    </p>
                  )}
                  <p className="text-sm">
                    {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant={
                    booking.status === "confirmed" ? "default" :
                    booking.status === "cancelled" ? "destructive" : 
                    "secondary"
                  }>
                    {booking.status}
                  </Badge>
                </div>
                <div className="flex gap-2 pt-2">
                  {booking.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateStatus(booking.id, "confirmed")}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(booking.id, "cancelled")}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this booking? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteBooking(booking.id)}>
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
        {bookings.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No bookings yet.</p>
        )}
      </CardContent>
    </Card>
  );
};