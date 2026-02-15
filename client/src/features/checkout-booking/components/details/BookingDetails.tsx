import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import "./bookingDetails.scss";

export interface BookingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

interface BookingDetailsProps {
  onDetailsChange: (details: BookingDetails) => void;
  initialDetails?: Partial<BookingDetails>;
}

const bookingDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[\d\s-()]+$/, "Invalid phone number"),
  specialRequests: z.string().optional(),
});

type BookingDetailsFormData = z.infer<typeof bookingDetailsSchema>;

const BookingDetails = ({
  onDetailsChange,
  initialDetails,
}: BookingDetailsProps) => {
  const {
    register,
    formState: { errors },
    watch,
  } = useForm<BookingDetailsFormData>({
    resolver: zodResolver(bookingDetailsSchema),
    defaultValues: {
      firstName: initialDetails?.firstName || "",
      lastName: initialDetails?.lastName || "",
      email: initialDetails?.email || "",
      phone: initialDetails?.phone || "",
      specialRequests: initialDetails?.specialRequests || "",
    },
  });

  const watchedValues = watch();

  const { firstName, lastName, email, phone, specialRequests } = watchedValues;

  useEffect(() => {
    onDetailsChange({
      firstName: firstName || "",
      lastName: lastName || "",
      email: email || "",
      phone: phone || "",
      specialRequests: specialRequests || "",
    });
  }, [firstName, lastName, email, phone, specialRequests, onDetailsChange]);

  return (
    <div className="booking-details">
      <div className="booking-details__header">
        <svg
          className="booking-details__icon"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <h3 className="booking-details__title">Guest Information</h3>
      </div>

      <form className="booking-details__form">
        <div className="booking-details__row">
          <div className="booking-details__field">
            <label htmlFor="firstName" className="booking-details__label">
              First Name <span className="booking-details__required">*</span>
            </label>
            <input
              {...register("firstName")}
              type="text"
              id="firstName"
              className={`booking-details__input ${
                errors.firstName ? "booking-details__input--error" : ""
              }`}
              placeholder="First Name"
            />
            {errors.firstName && (
              <span className="booking-details__error">
                {errors.firstName.message}
              </span>
            )}
          </div>

          <div className="booking-details__field">
            <label htmlFor="lastName" className="booking-details__label">
              Last Name <span className="booking-details__required">*</span>
            </label>
            <input
              {...register("lastName")}
              type="text"
              id="lastName"
              className={`booking-details__input ${
                errors.lastName ? "booking-details__input--error" : ""
              }`}
              placeholder="Last Name"
            />
            {errors.lastName && (
              <span className="booking-details__error">
                {errors.lastName.message}
              </span>
            )}
          </div>
        </div>

        <div className="booking-details__field">
          <label htmlFor="email" className="booking-details__label">
            Email Address <span className="booking-details__required">*</span>
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            className={`booking-details__input ${
              errors.email ? "booking-details__input--error" : ""
            }`}
            placeholder="Email Address"
          />
          {errors.email && (
            <span className="booking-details__error">
              {errors.email.message}
            </span>
          )}
        </div>

        <div className="booking-details__field">
          <label htmlFor="phone" className="booking-details__label">
            Phone Number <span className="booking-details__required">*</span>
          </label>
          <input
            {...register("phone")}
            type="tel"
            id="phone"
            className={`booking-details__input ${
              errors.phone ? "booking-details__input--error" : ""
            }`}
            placeholder="Phone Number"
          />
          {errors.phone && (
            <span className="booking-details__error">
              {errors.phone.message}
            </span>
          )}
        </div>

        <div className="booking-details__field">
          <label htmlFor="specialRequests" className="booking-details__label">
            Special Requests (Optional)
          </label>
          <textarea
            {...register("specialRequests")}
            id="specialRequests"
            className="booking-details__textarea"
            rows={4}
            placeholder="Any special requirements or requests..."
          />
        </div>
      </form>
    </div>
  );
};

export default BookingDetails;
