import { z } from "zod";
import { PK_PHONE_REGEX } from "@/lib/constants";

const pkPhone = z
  .string()
  .min(11)
  .max(11)
  .regex(PK_PHONE_REGEX, "Must be 11 digits starting with 03");

const signupEmail = z
  .string()
  .min(3)
  .email("Enter a valid email")
  .transform((s) => s.trim().toLowerCase());

const cnic4 = z
  .string()
  .min(4)
  .max(4)
  .regex(/^\d{4}$/, "Last 4 digits of CNIC");

const areaWithOther = z.object({
  route_from: z.string().min(1, "Select an area"),
  route_from_other: z.string().optional(),
  route_to: z.string().min(1, "Select an area"),
  route_to_other: z.string().optional(),
});

export const driverSignupSchema = areaWithOther
  .extend({
    full_name: z.string().min(3, "At least 3 characters"),
    email: signupEmail,
    whatsapp_phone: pkPhone,
    cnic_last4: cnic4,
    car_make_model: z.string().min(2, "Required"),
    car_color: z.string().min(2, "Required"),
    number_plate: z.string().min(2, "Required"),
    departure_time: z.string().min(1, "Select time"),
    days_available: z.array(z.string()).min(1, "Pick at least one day"),
    available_seats: z.coerce.number().refine((n) => [1, 2, 3, 4].includes(n)),
    notes: z.string().max(300).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.route_from === "Other" && !data.route_from_other?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Specify area",
        path: ["route_from_other"],
      });
    }
    if (data.route_to === "Other" && !data.route_to_other?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Specify area",
        path: ["route_to_other"],
      });
    }
  });

export const passengerSignupSchema = areaWithOther
  .extend({
    full_name: z.string().min(3, "At least 3 characters"),
    email: signupEmail,
    whatsapp_phone: pkPhone,
    cnic_last4: cnic4,
    preferred_time: z.string().min(1, "Select time"),
    days_needed: z.array(z.string()).min(1, "Pick at least one day"),
    seats_needed: z.coerce.number().refine((n) => n === 1 || n === 2),
    notes: z.string().max(300).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.route_from === "Other" && !data.route_from_other?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Specify area",
        path: ["route_from_other"],
      });
    }
    if (data.route_to === "Other" && !data.route_to_other?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Specify area",
        path: ["route_to_other"],
      });
    }
  });

export const onboardingSchema = z.object({
  full_name: z.string().min(3),
  cnic_last4: cnic4,
  role: z.enum(["driver", "passenger", "both"]),
  vehicle_make_model: z.string().optional(),
  vehicle_color: z.string().optional(),
  vehicle_plate: z.string().optional(),
  emergency_contact_phone: z.union([z.literal(""), pkPhone]),
}).superRefine((data, ctx) => {
  if (data.role === "driver" || data.role === "both") {
    if (!data.vehicle_make_model?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for drivers", path: ["vehicle_make_model"] });
    }
    if (!data.vehicle_color?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for drivers", path: ["vehicle_color"] });
    }
    if (!data.vehicle_plate?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required for drivers", path: ["vehicle_plate"] });
    }
  }
});

export const rideCreateSchema = z.object({
  from_area: z.string().min(1),
  from_area_other: z.string().optional(),
  to_area: z.string().min(1),
  to_area_other: z.string().optional(),
  departure_time: z.string().min(1),
  days: z.array(z.string()).min(1),
  seats_available: z.coerce.number().min(1).max(4),
  women_only: z.boolean().optional(),
  meeting_point: z.string().optional(),
  notes: z.string().max(500).optional(),
  vehicle_id: z.string().uuid().optional(),
}).superRefine((data, ctx) => {
  if (data.from_area === "Other" && !data.from_area_other?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Specify", path: ["from_area_other"] });
  }
  if (data.to_area === "Other" && !data.to_area_other?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Specify", path: ["to_area_other"] });
  }
});

export const bookingPaymentSchema = z.object({
  booking_id: z.string().uuid(),
  payment_method: z.enum(["jazzcash", "easypaisa", "bank"]),
  payment_ref: z.string().min(4, "Enter reference / transaction ID"),
});

export const ratingSchema = z.object({
  ride_id: z.string().uuid(),
  to_user_id: z.string().uuid(),
  score: z.coerce.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export type DriverSignupInput = z.infer<typeof driverSignupSchema>;
export type PassengerSignupInput = z.infer<typeof passengerSignupSchema>;

/** REST / Route Handler bodies & query */
export const bookRideBodySchema = z.object({
  ride_id: z.string().uuid(),
  seats: z.coerce.number().min(1).max(4).optional().default(1),
});

export const bookingPaymentSubmitSchema = bookingPaymentSchema;

export const ridesListQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  around: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export const matchCreateBodySchema = z.object({
  driver_signup_id: z.string().uuid(),
  passenger_signup_id: z.string().uuid(),
  notes: z.string().max(500).optional().nullable(),
});

export const matchStatusBodySchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "no_show", "cancelled"]),
});

export const vehicleCreateBodySchema = z.object({
  make_model: z.string().min(2),
  color: z.string().min(2),
  number_plate: z.string().min(2),
  total_seats: z.coerce.number().min(1).max(8).optional().default(4),
});

export const profilePatchSchema = z.object({
  full_name: z.string().min(3).optional(),
  emergency_contact_phone: z.string().optional(),
});

export const vehiclePatchSchema = vehicleCreateBodySchema.partial();

export const otpSendBodySchema = z.object({
  phone: z.string().min(8),
});

export const otpVerifyBodySchema = z.object({
  phone: z.string().min(8),
  token: z.string().min(4),
});

export const otpBypassBodySchema = z.object({
  phone: z.string().min(8),
});

export const sosBodySchema = z.object({
  ride_id: z.string().uuid(),
});
