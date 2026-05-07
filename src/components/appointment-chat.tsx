import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { useAppointmentMessages, useSendMessage, useUploadFile, useSendImage } from "@/hooks/use-messages";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, Loader2, Image as ImageIcon, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/translations";
import { useToast } from "@/hooks/use-toast";

interface AppointmentChatProps {
  appointmentId: number;
  doctorName?: string | null;
  patientName?: string | null;
}

export function AppointmentChat({ appointmentId, doctorName, patientName }: AppointmentChatProps) {
  const t = useT();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: messages, isLoading } = useAppointmentMessages(appointmentId);
  const sendMessage = useSendMessage(appointmentId);
  const sendImage = useSendImage(appointmentId);
  const uploadFile = useUploadFile();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const content = text.trim();
    if (!content || sendMessage.isPending) return;
    sendMessage.mutate(content);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { url } = await uploadFile.mutateAsync(file);
      await sendImage.mutateAsync({
        content: `Sent an image: ${file.name}`,
        type: "image",
        fileUrl: url,
      });
      toast({ title: t("chat_uploadSuccess") || "File uploaded successfully" });
    } catch (error: any) {
      console.error("Upload failed", error);
      toast({ 
        title: t("chat_uploadFailed") || "Upload failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const otherParty = user?.role === "patient" ? doctorName : patientName;

  return (
    <div className="border rounded-xl overflow-hidden bg-background flex flex-col" style={{ minHeight: 320, maxHeight: 480 }}>
      <div className="px-4 py-3 bg-primary/5 border-b flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm">{t("chat_sessionChat")}</span>
        {otherParty && <span className="text-xs text-muted-foreground ml-1">· {otherParty}</span>}
        <span className="ml-auto text-xs text-muted-foreground">{t("chat_refreshes")}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex justify-center pt-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full pt-8 text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">{t("chat_noMessages")}</p>
          </div>
        ) : (
          messages.map(msg => {
            const isOwn = msg.senderId === user?.id;
            const isDoctor = msg.senderRole === "doctor";
            const isAdmin = msg.senderRole === "admin";
            return (
              <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                  isOwn
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                )}>
                  {!isOwn && (
                    <div className="text-xs font-semibold mb-0.5 opacity-70">
                      {isDoctor ? `Dr. ${msg.senderName.replace(/^Dr\.?\s*/i, "")}` : isAdmin ? `${t("common_admin") || "Admin"} (${msg.senderName})` : msg.senderName}
                    </div>
                  )}
                  {msg.type === "image" && msg.fileUrl ? (
                    <div className="mb-1 rounded-lg overflow-hidden border bg-background/20">
                      {(msg.fileUrl.startsWith("data:image/") || msg.fileUrl.toLowerCase().match(/\.(jpeg|jpg|png|gif|webp)$/)) ? (
                        <img 
                          src={(msg.fileUrl.startsWith("http") || msg.fileUrl.startsWith("data:")) ? msg.fileUrl : `${window.location.origin}${msg.fileUrl}`} 
                          alt="Shared image" 
                          className="max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open((msg.fileUrl!.startsWith("http") || msg.fileUrl!.startsWith("data:")) ? msg.fileUrl! : `${window.location.origin}${msg.fileUrl}`, "_blank")}
                        />
                      ) : (
                        <div 
                          className="p-4 flex items-center gap-3 cursor-pointer hover:bg-background/40 transition-colors"
                          onClick={() => window.open(msg.fileUrl!.startsWith("http") ? msg.fileUrl! : `${window.location.origin}${msg.fileUrl}`, "_blank")}
                        >
                          <Paperclip className="h-5 w-5 text-primary" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{msg.content.replace("Sent an image: ", "")}</div>
                            <div className="text-[10px] opacity-60 uppercase">{msg.fileUrl.split(".").pop()}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words leading-snug">{msg.content}</p>
                  )}
                  <div className={cn("text-[10px] mt-1 opacity-60 text-right", isOwn ? "" : "")}>
                    {format(new Date(msg.createdAt), "h:mm a")}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t bg-muted/20">
        <div className="flex gap-2 items-end">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadFile.isPending || sendImage.isPending}
            className="shrink-0 h-10 w-10 text-muted-foreground hover:text-primary"
          >
            {uploadFile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
          </Button>
          <Textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("chat_typeMessage")}
            className="resize-none min-h-[40px] max-h-[100px] text-sm"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!text.trim() || sendMessage.isPending}
            className="shrink-0 h-10 w-10"
          >
            {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
