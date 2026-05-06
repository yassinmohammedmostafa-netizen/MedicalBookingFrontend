import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isBefore, startOfDay } from "date-fns";
import { useGetCalendarAppointments } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/translations";

export default function AdminCalendar() {
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
    return appointments.filter(app => {
      if (!app.startTime) return false;
      return isSameDay(new Date(app.startTime), date);
    }).sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime());
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
            <h1 className="text-3xl font-bold mb-2">{t("admin_platformCalendar")}</h1>
            <p className="text-muted-foreground">{t("admin_platformCalendarSub")}</p>
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
                    <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4 rtl:rotate-180" />
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
                    <div key={`empty-${i}`} className="p-2 h-24 border rounded-md border-transparent bg-muted/10"></div>
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
                          isSelected ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 
                          isBefore(date, startOfDay(new Date())) ? 'bg-muted/30 border-muted text-muted-foreground opacity-60' :
                          'border-border hover:border-primary/50 hover:bg-muted/30'
                        }`}
                      >
                        <div className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                          isCurrentDay ? 'bg-primary text-primary-foreground' : ''
                        }`}>
                          {format(date, "d")}
                        </div>
                        
                        <div className="mt-1 flex flex-col gap-1 overflow-hidden">
                          {dayAppointments.length > 0 && (
                            <div className="text-xs text-center py-1 bg-primary/10 text-primary rounded font-semibold mt-2">
                              {dayAppointments.length} {dayAppointments.length > 1 ? t("admin_calAppts") : t("admin_calAppt")}
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
                  {selectedDate ? format(selectedDate, "EEEE, MMMM d") : t("cal_selectDate")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : !selectedDate ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {t("cal_selectDate")}
                  </div>
                ) : selectedDayAppointments.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {t("admin_noApptDay")}
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
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            {t("status_paid")}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                          <div>
                            <span className="text-muted-foreground text-xs block">{t("admin_calPatient")}</span>
                            <span className="font-medium">{app.patientName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs block">{t("admin_calDoctor")}</span>
                            <span className="font-medium">{app.doctorName}</span>
                          </div>
                        </div>
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
