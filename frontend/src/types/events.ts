import { User } from "./user";

// types/events.ts
export interface EventParticipant {
  user: User;
  registeredAt: string;
  paymentStatus: 'pending' | 'paid';
}

export interface WaitlistParticipant {
  user: User;
  addedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description?: string;
  eventType: 'competition' | 'clinic' | 'social' | 'maintenance' | 'show';
  startDate: string;
  endDate: string;
  location?: string;
  maxParticipants?: number;
  registrationFee: number;
  organizer: User; // Полный объект пользователя
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  requirements?: string;
  participants: EventParticipant[]; // Массив объектов с информацией о регистрации
  waitlist?: WaitlistParticipant[]; // Лист ожидания
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface EventDetailProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export interface EventFormData {
  title: string;
  description?: string;
  eventType: 'competition' | 'clinic' | 'social' | 'maintenance' | 'show';
  startDate: string;
  endDate: string;
  location?: string;
  maxParticipants?: number;
  registrationFee: number;
  requirements?: string;
}

export interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event?: Event | null;
  mode?: 'create' | 'edit';
}