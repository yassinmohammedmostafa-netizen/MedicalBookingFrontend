import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "../../api-client-react/src/index.js";

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  return customFetch<T>(path, options);
}

export interface Message {
  id: number;
  appointmentId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  content: string;
  type: "text" | "image";
  fileUrl?: string | null;
  createdAt: string;
}

export function messagesQueryKey(appointmentId: number) {
  return ["appointment-messages", appointmentId];
}

export function useAppointmentMessages(appointmentId: number) {
  return useQuery<Message[]>({
    queryKey: messagesQueryKey(appointmentId),
    queryFn: () => apiFetch<Message[]>(`/api/appointments/${appointmentId}/messages`),
    refetchInterval: 8000,
    enabled: !!appointmentId,
  });
}

export function useSendMessage(appointmentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      apiFetch<Message>(`/api/appointments/${appointmentId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messagesQueryKey(appointmentId) });
    },
  });
}

export function useSendImage(appointmentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string; type: "image"; fileUrl: string }) =>
      apiFetch<Message>(`/api/appointments/${appointmentId}/messages`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messagesQueryKey(appointmentId) });
    },
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return customFetch<{ url: string; filename: string }>("/api/uploads", {
        method: "POST",
        body: formData,
      });
    },
  });
}

export async function registerDoctor(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  specialty: string[];
  type: "psychiatrist" | "psychologist";
  gender: "male" | "female";
  price: number;
  bio?: string;
  yearsExperience?: number;
  languages?: string[];
  sessionType?: "individual" | "group" | "both";
  paymentInfo?: string;
}) {
  return apiFetch<{ success: boolean; message: string }>(`/api/auth/register-doctor`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
