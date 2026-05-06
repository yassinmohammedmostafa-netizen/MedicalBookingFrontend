import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isBefore, startOfDay } from "date-fns";
import { useGetCalendarAppointments } from "../../../api-client-react/src/index.js";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Video, Clock } from "lucide-react";
import { useT } from "@/lib/translations";

export default function DoctorCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const t = useT();

  const { data: appointments, isLoading } = useGetCalendarAppointments();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getAppointmentsForDay = (date: Date) => {
    if (!appointments) return [];
    return appointments
      .filter(app => app.startTime && isSameDay(new Date(app.startTime), date))
      .sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime());
  };

  const selectedDayAppointments = selectedDate ? getAppointmentsForDay(selectedDate) : [];

  const dayNames = [
    t("cal_sun"), t("cal_mon"), t("cal_tue"), t("cal_wed"),
    t("cal_thu"), t("cal_fri"), t("cal_sat"),
  ];

  return (
    <Layout>
      <div className="container px-4 mx-auto py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("dr_calendarTitle")}</h1>
            <p className="text-muted-foreground">{t("dr_calendarSub")}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-xl font-bold">
                  {format(currentDate, "MMMM yyyy")}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="text-xs font-semibold text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2 h-24 border rounded-md border-transparent bg-muted/10" />
                  ))}

                  {daysInMonth.map((date) => {
                    const dayAppointments = getAppointmentsForDay(date);
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const isCurrentDay = isToday(date);

                    return (
                      <div
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`p-2 h-24 border rounded-md cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                            : isBefore(date, startOfDay(new Date()))
                              ? "bg-muted/30 border-muted text-muted-foreground opacity-60"
                              : "border-border hover:border-primary/50 hover:bg-muted/30"
                        }`}
                      >
                        <div className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                          isCurrentDay ? "bg-primary text-primary-foreground" : ""
                        }`}>
                          {format(date, "d")}
                        </div>

                        <div className="mt-1 flex flex-col gap-1 overflow-hidden">
                          {dayAppointments.slice(0, 2).map((app, j) => (
                            <div key={j} className="text-[10px] truncate px-1 py-0.5 bg-green-100 text-green-800 rounded font-medium">
                              {format(new Date(app.startTime!), "HH:mm")} {app.patientName}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-[10px] text-muted-foreground font-medium ps-1">
                              +{dayAppointments.length - 2} {t("cal_more")}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg">
                  {selectedDate ? format(selectedDate, "EEEE, MMMM d") : t("dr_selectDate")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : !selectedDate ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {t("cal_selectDate")}
                  </div>
                ) : selectedDayAppointments.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {t("dr_noCalAppts")}
                  </div>
                ) : (
                  <div className="divide-y max-h-[600px] overflow-y-auto">
                    {selectedDayAppointments.map(app => (
                      <div key={app.id} className="p-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-lg flex items-center">
                            <Clock className="w-4 h-4 me-2 text-primary" />
                            {format(new Date(app.startTime!), "h:mm a")}
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {t("status_paid")}
                          </Badge>
                        </div>
                        <div className="font-medium text-foreground mb-1">{app.patientName}</div>
                        <div className="flex items-center text-sm text-muted-foreground mt-2">
                          <Video className="w-3.5 h-3.5 me-1.5" /> {t("appt_onlineSession")}
                        </div>
                        {app.notes && (
                          <div className="mt-3 text-sm bg-muted/50 p-2 rounded-md italic text-muted-foreground">
                            "{app.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">{t("dr_calendarNote")}</p>
      </div>
    </Layout>
  );
}
