import { useState, lazy, Suspense } from "react";
import toast from "react-hot-toast";
import type { Booking } from "../../../../types";
import { useCancelBookingMutation } from "../../slice/BookingSlice";
import Loader from "../../../../components/loader/Loader";

const ViewBookingModal = lazy(
  () => import("../view-booking-modal/ViewBookingModal")
);

import "./bookingCard.scss";

interface BookingCardProps {
  booking: Booking;
}

const BookingCard = ({ booking }: BookingCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelBooking, { isLoading: isCancelling }] =
    useCancelBookingMutation();

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "booking-card__status--confirmed";
      case "pending":
        return "booking-card__status--pending";
      case "cancelled":
        return "booking-card__status--cancelled";
      case "completed":
        return "booking-card__status--completed";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCancelBooking = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to cancel this booking? This action cannot be undone."
      )
    ) {
      try {
        await cancelBooking(id).unwrap();
        toast.success("Booking cancelled successfully");
        setIsModalOpen(false);
      } catch (error: any) {
        toast.error(error.data?.message || "Failed to cancel booking");
      }
    }
  };

  return (
    <>
      <div className="booking-card">
        <div className="booking-card__header">
          <span className="booking-card__id">
            Booking #{booking.id.slice(0, 8)}
          </span>
          <span
            className={`booking-card__status ${getStatusClass(booking.status)}`}
          >
            {booking.status}
          </span>
        </div>

        <div className="booking-card__content">
          <div className="booking-card__info">
            <span className="booking-card__label">Hotel</span>
            <span className="booking-card__value">
              {booking.hotel?.name || "N/A"}
            </span>
          </div>

          <div className="booking-card__info">
            <span className="booking-card__label">Check-in</span>
            <span className="booking-card__value">
              {formatDate(booking.checkInDate)}
            </span>
          </div>

          <div className="booking-card__info">
            <span className="booking-card__label">Check-out</span>
            <span className="booking-card__value">
              {formatDate(booking.checkOutDate)}
            </span>
          </div>

          <div className="booking-card__info">
            <span className="booking-card__label">Guests</span>
            <span className="booking-card__value">
              {booking.numberOfGuests}
            </span>
          </div>

          <div className="booking-card__info">
            <span className="booking-card__label">Total Amount</span>
            <span className="booking-card__value">
              {booking.paymentCurrency}{" "}
              {Number(booking.paymentAmount).toFixed(2)}
            </span>
          </div>

          <div className="booking-card__info">
            <span className="booking-card__label">Payment Status</span>
            <span className="booking-card__value">{booking.paymentStatus}</span>
          </div>
        </div>

        <div className="booking-card__actions">
          <button
            className="booking-card__btn"
            onClick={() => setIsModalOpen(true)}
          >
            View Details
          </button>
          {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
            <button
              className="booking-card__btn booking-card__btn--danger"
              onClick={() => handleCancelBooking(booking.id)}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Cancel Booking"}
            </button>
          )}
        </div>
      </div>

      {isModalOpen && (
        <Suspense fallback={<Loader />}>
          <ViewBookingModal
            booking={booking}
            onClose={() => setIsModalOpen(false)}
            onCancel={handleCancelBooking}
            isCancelling={isCancelling}
          />
        </Suspense>
      )}
    </>
  );
};

export default BookingCard;
