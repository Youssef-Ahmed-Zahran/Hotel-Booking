import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Calendar, Users, Info, ChevronDown } from "lucide-react";
import { useGetCurrentUserQuery } from "../../../auth/slice/authSlice";
import { useCheckAvailabilityMutation } from "../../../my-bookings/slice/BookingSlice";
import type { BookingType } from "../../../../types";
import "./createBooking.scss";

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

import {
  bookingSchema,
  type BookingFormData,
} from "../../../../validation/booking";

interface CreateBookingProps {
  hotelId: string;
  apartmentId?: string;
  roomId?: string;
  pricePerNight: number;
  bookingType: BookingType;
  maxGuests?: number;
}

const CreateBooking = ({
  hotelId,
  apartmentId,
  roomId,
  pricePerNight,
  bookingType,
  maxGuests = 10,
}: CreateBookingProps) => {
  const navigate = useNavigate();
  const { data: user } = useGetCurrentUserQuery();
  const [checkAvailability, { isLoading: isChecking }] =
    useCheckAvailabilityMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      checkInDate: today,
      checkOutDate: tomorrow,
      numberOfGuests: 1,
    },
  });

  const watchedValues = watch();

  // Calculate number of nights and total
  const { nights, subtotal, serviceFee, tax, total } = useMemo(() => {
    const checkIn = new Date(watchedValues.checkInDate || today);
    const checkOut = new Date(watchedValues.checkOutDate || tomorrow);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const nightsCount = diffDays > 0 ? diffDays : 0;
    const subtotalAmount = nightsCount * pricePerNight;
    const serviceFeeAmount = subtotalAmount * 0.005; // 0.5% service fee
    const taxAmount = subtotalAmount * 0.005; // 0.5% tax

    return {
      nights: nightsCount,
      subtotal: subtotalAmount,
      serviceFee: serviceFeeAmount,
      tax: taxAmount,
      total: subtotalAmount + serviceFeeAmount + taxAmount,
    };
  }, [watchedValues.checkInDate, watchedValues.checkOutDate, pricePerNight]);

  const onSubmit = async (data: BookingFormData) => {
    if (!user) {
      toast.error("Please log in to make a booking");
      return;
    }

    try {
      // Check availability before proceeding
      const availability = await checkAvailability({
        apartmentId,
        roomId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        bookingType,
      }).unwrap();

      if (!availability.available) {
        const reason =
          availability.reason || "Selected dates are not available";
        toast.error(reason);
        return;
      }

      // Navigate to checkout with booking data
      const bookingData = {
        hotelId,
        apartmentId,
        roomId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        numberOfGuests: data.numberOfGuests,
        bookingType,
        pricePerNight,
        totalAmount: total,
      };

      navigate("/checkout", { state: { bookingData } });
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || "Failed to check availability. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="create-booking">
      <div className="create-booking__header">
        <h3 className="create-booking__title">Book Your Stay</h3>
        <p className="create-booking__subtitle">
          Experience comfort and luxury
        </p>
      </div>

      <div className="create-booking__price-card">
        <div className="create-booking__price-info">
          <span className="create-booking__price-value">${pricePerNight}</span>
          <span className="create-booking__price-period">/ night</span>
        </div>
        <div className="create-booking__badge">Best Price</div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="create-booking__form">
        <div className="create-booking__section">
          <div className="create-booking__section-header">
            <Calendar size={18} className="create-booking__section-icon" />
            <span className="create-booking__section-title">Dates</span>
          </div>

          <div className="create-booking__dates-grid">
            <div className="create-booking__field">
              <label htmlFor="checkInDate" className="create-booking__label">
                Check-in
              </label>
              <div className="create-booking__input-wrapper">
                <input
                  {...register("checkInDate")}
                  type="date"
                  id="checkInDate"
                  className={`create-booking__input ${
                    errors.checkInDate ? "has-error" : ""
                  }`}
                  min={today}
                />
              </div>
              {errors.checkInDate && (
                <span className="error-message">
                  {errors.checkInDate.message}
                </span>
              )}
            </div>

            <div className="create-booking__field">
              <label htmlFor="checkOutDate" className="create-booking__label">
                Check-out
              </label>
              <div className="create-booking__input-wrapper">
                <input
                  {...register("checkOutDate")}
                  type="date"
                  id="checkOutDate"
                  className={`create-booking__input ${
                    errors.checkOutDate ? "has-error" : ""
                  }`}
                  min={watchedValues.checkInDate || today}
                />
              </div>
              {errors.checkOutDate && (
                <span className="error-message">
                  {errors.checkOutDate.message}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="create-booking__section">
          <div className="create-booking__section-header">
            <Users size={18} className="create-booking__section-icon" />
            <span className="create-booking__section-title">Guests</span>
          </div>

          <div className="create-booking__field">
            <div className="create-booking__input-wrapper">
              <select
                {...register("numberOfGuests", { valueAsNumber: true })}
                id="numberOfGuests"
                className={`create-booking__input create-booking__input--select ${
                  errors.numberOfGuests ? "has-error" : ""
                }`}
              >
                {Array.from({ length: maxGuests }, (_, i) => i + 1).map(
                  (num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </option>
                  )
                )}
              </select>
              <ChevronDown className="create-booking__select-icon" size={16} />
            </div>
            {errors.numberOfGuests && (
              <span className="error-message">
                {errors.numberOfGuests.message}
              </span>
            )}
          </div>
        </div>

        {nights > 0 && (
          <div className="create-booking__summary">
            <div className="create-booking__summary-item">
              <div className="create-booking__summary-label">
                <span>
                  ${pricePerNight} × {nights}{" "}
                  {nights === 1 ? "night" : "nights"}
                </span>
              </div>
              <div className="create-booking__summary-value">
                ${subtotal.toFixed(2)}
              </div>
            </div>

            <div className="create-booking__summary-item">
              <div className="create-booking__summary-label">Service fee</div>
              <div className="create-booking__summary-value">
                ${serviceFee.toFixed(2)}
              </div>
            </div>

            <div className="create-booking__summary-item">
              <div className="create-booking__summary-label">Taxes</div>
              <div className="create-booking__summary-value">
                ${tax.toFixed(2)}
              </div>
            </div>

            <div className="create-booking__summary-divider" />

            <div className="create-booking__summary-item create-booking__summary-item--total">
              <div className="create-booking__summary-label">Total Payment</div>
              <div className="create-booking__summary-value">
                ${total.toFixed(2)}
              </div>
            </div>

            <div className="create-booking__info-note">
              <Info size={14} />
              <span>You won't be charged yet</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          className={`create-booking__submit-btn ${
            isChecking ? "create-booking__submit-btn--loading" : ""
          }`}
          disabled={nights <= 0 || isChecking}
        >
          {isChecking ? (
            <span className="create-booking__spinner" />
          ) : (
            "Reserve Now"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateBooking;
