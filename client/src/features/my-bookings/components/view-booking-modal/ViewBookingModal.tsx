import { X, Calendar, User, CreditCard, Building, MapPin } from "lucide-react";
import type { Booking } from "../../../../types";
import "./viewBookingModal.scss";

interface ViewBookingModalProps {
  booking: Booking;
  onClose: () => void;
  onCancel: (id: string) => void;
  isCancelling?: boolean;
}

const ViewBookingModal = ({
  booking,
  onClose,
  onCancel,
  isCancelling = false,
}: ViewBookingModalProps) => {
  if (!booking) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "status--confirmed";
      case "pending":
        return "status--pending";
      case "cancelled":
        return "status--cancelled";
      case "completed":
        return "status--completed";
      default:
        return "";
    }
  };

  // Determine if booking can be cancelled
  const canCancel =
    booking.status !== "CANCELLED" && booking.status !== "COMPLETED";

  return (
    <div className="view-booking-modal-overlay" onClick={onClose}>
      <div className="view-booking-modal" onClick={(e) => e.stopPropagation()}>
        <button className="view-booking-modal__close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="view-booking-modal__header">
          <h2>Booking Details</h2>
          <span
            className={`view-booking-modal__status ${getStatusClass(
              booking.status
            )}`}
          >
            {booking.status}
          </span>
        </div>

        <div className="view-booking-modal__content">
          <div className="booking-section">
            <h3>
              <Building size={20} /> Property Information
            </h3>
            <div className="booking-details-grid">
              <div className="detail-item">
                <span className="label">Hotel</span>
                <span className="value">{booking.hotel?.name || "N/A"}</span>
              </div>
              <div className="detail-item">
                <span className="label">Address</span>
                <span className="value">
                  <MapPin
                    size={14}
                    style={{ display: "inline", marginRight: "4px" }}
                  />
                  {booking.hotel?.address}, {booking.hotel?.city},{" "}
                  {booking.hotel?.country}
                </span>
              </div>
              {booking.apartment && (
                <div className="detail-item">
                  <span className="label">Apartment</span>
                  <span className="value">
                    {booking.apartment.name} (Unit{" "}
                    {booking.apartment.apartmentNumber})
                  </span>
                </div>
              )}
              {booking.room && (
                <div className="detail-item">
                  <span className="label">Room</span>
                  <span className="value">
                    Room {booking.room.roomNumber} ({booking.room.roomType})
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="booking-section">
            <h3>
              <Calendar size={20} /> Reservation Details
            </h3>
            <div className="booking-details-grid">
              <div className="detail-item">
                <span className="label">Check-in</span>
                <span className="value">{formatDate(booking.checkInDate)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Check-out</span>
                <span className="value">
                  {formatDate(booking.checkOutDate)}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Guests</span>
                <span className="value">
                  <User
                    size={14}
                    style={{ display: "inline", marginRight: "4px" }}
                  />
                  {booking.numberOfGuests} Guests
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Reference ID</span>
                <span className="value mono">{booking.id}</span>
              </div>
            </div>
          </div>

          <div className="booking-section">
            <h3>
              <CreditCard size={20} /> Payment Information
            </h3>
            <div className="booking-details-grid">
              <div className="detail-item">
                <span className="label">Total Amount</span>
                <span className="value amount">
                  {booking.paymentCurrency}{" "}
                  {Number(booking.paymentAmount).toFixed(2)}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Payment Method</span>
                <span className="value">{booking.paymentMethod}</span>
              </div>
              <div className="detail-item">
                <span className="label">Payment Status</span>
                <span className="value">{booking.paymentStatus}</span>
              </div>
              {booking.paymentTransactionId && (
                <div className="detail-item">
                  <span className="label">Transaction ID</span>
                  <span className="value mono">
                    {booking.paymentTransactionId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="view-booking-modal__footer">
          {canCancel && (
            <button
              className="btn btn-danger"
              onClick={() => onCancel(booking.id)}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Cancel Booking"}
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewBookingModal;
