import { useState } from "react";
import { format } from "date-fns";
import {
  useGetDoctorOwnSlots,
  useCreateSlot,
  useDeleteSlot,
  getGetDoctorOwnSlotsQueryKey
} from "../../../api-client-react/src/index.js";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/lib/translations";
import { Trash2, Plus, Calendar as CalendarIcon, Clock } from "lucide-react";

export default function DoctorSlots() {
  const { data: slots, isLoading } = useGetDoctorOwnSlots();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const t = useT();

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const createSlotMutation = useCreateSlot({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDoctorOwnSlotsQueryKey() });
        toast({ title: t("dr_slotCreated") });
        setDate(""); setStartTime("");
      },
      onError: (error: any) => {
        toast({ title: t("dr_slotCreateFail"), description: error.message, variant: "destructive" });
      }
    }
  });

  const deleteSlotMutation = useDeleteSlot({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDoctorOwnSlotsQueryKey() });
        toast({ title: t("dr_slotDeleted") });
      }
    }
  });

  const handleAddSlot = () => {
    if (!date || !startTime) {
      toast({ title: t("dr_fillFields"), variant: "destructive" });
      return;
    }
    // Handle time format with or without seconds
    const timeStr = startTime.split(':').length === 2 ? `${startTime}:00` : startTime;
    const startDateTime = new Date(`${date}T${timeStr}`);
    
    if (isNaN(startDateTime.getTime())) {
      toast({ title: t("common_error") || "Invalid date or time", variant: "destructive" });
      return;
    }

    if (startDateTime < new Date()) {
      toast({ 
        title: t("dr_pastDateError") || "Cannot create slots in the past", 
        description: t("dr_pastDateDesc") || "Please select a future date and time.",
        variant: "destructive" 
      });
      return;
    }

    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);
    createSlotMutation.mutate({
      data: { startTime: startDateTime.toISOString(), endTime: endDateTime.toISOString() }
    });
  };

  return (
    <Layout>
      <div className="container px-4 mx-auto py-12 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">{t("dr_slotsTitle")}</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{t("dr_addSlot")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("dr_date")}</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    data-testid="input-slot-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("dr_startTime")}</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    data-testid="input-slot-start"
                  />
                  <p className="text-[10px] text-muted-foreground">{t("dr_slotsNotice") || "Price is for every half hour session"}</p>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={handleAddSlot}
                  disabled={createSlotMutation.isPending}
                  data-testid="button-add-slot"
                >
                  <Plus className="w-4 h-4 me-2" />
                  {createSlotMutation.isPending ? t("dr_adding") : t("dr_addSlotBtn")}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("dr_yourSlots")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : !slots || slots.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarIcon className="mx-auto h-12 w-12 mb-4 opacity-20" />
                    <p>{t("dr_noSlots")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {slots.map(slot => (
                      <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 min-w-0">
                          <div className="flex items-center text-primary font-medium shrink-0">
                            <CalendarIcon className="w-4 h-4 me-2 shrink-0" />
                            {format(new Date(slot.startTime), "MMM d, yyyy")}
                          </div>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Clock className="w-3.5 h-3.5 me-1.5 shrink-0" />
                            {format(new Date(slot.startTime), "h:mm a")} (30 mins)
                          </div>
                          {slot.isBooked ? (
                            <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded-full w-fit">
                              {t("dr_booked")}
                            </span>
                          ) : (slot as any).hasPending ? (
                            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full w-fit">
                              {t("status_pending")}
                            </span>
                          ) : null}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => deleteSlotMutation.mutate({ id: slot.id })}
                          disabled={slot.isBooked || (slot as any).hasPending || deleteSlotMutation.isPending}
                          data-testid={`button-delete-slot-${slot.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
