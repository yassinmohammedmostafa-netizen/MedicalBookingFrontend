import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("esaal_token");
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? res.statusText);
  }
  return res.json();
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
      const token = localStorage.getItem("esaal_token");
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Upload failed");
      }
      return res.json() as Promise<{ url: string; filename: string }>;
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
