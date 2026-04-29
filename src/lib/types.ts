export type Role = "STUDENT" | "ORGANIZER" | "ADMIN";
export type UserStatus = "ACTIVE" | "PENDING" | "SUSPENDED";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type OrganizerRef = { id: string; name: string; email?: string };

export type EventListItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  seats: number;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
  organizer: { id: string; name: string };
  seatsTaken: number;
  seatsAvailable: number;
};

export type EventDetail = EventListItem;

export type RegistrationRow = {
  id: string;
  userId: string;
  eventId: string;
  status: "REGISTERED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  event: EventDetail;
};

export type NotificationItem = {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; error: string };
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
