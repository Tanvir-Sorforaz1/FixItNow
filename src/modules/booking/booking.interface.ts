export type BookingInput = {
  serviceId: string;
  technicianProfileId: string;
  scheduledAt: string;
  durationMinutes?: number;
  address: string;
  notes?: string;
};

export type BookingStatusUpdateInput = {
  status: "CANCELLED";
};
