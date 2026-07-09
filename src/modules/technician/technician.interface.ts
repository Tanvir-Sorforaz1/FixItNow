export type TechnicianProfileInput = {
  bio?: string;
  experience?: number;
  skills?: string[];
  hourlyRate?: number;
  location?: string;
  availability?: unknown;
  isAvailable?: boolean;
};

export type TechnicianBookingStatusInput = {
  status: "ACCEPTED" | "DECLINED" | "IN_PROGRESS" | "COMPLETED";
};
