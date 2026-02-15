import type { Booking } from "../../../../../types";
import "./viewBooking.scss";

interface ViewBookingModalProps {
  booking: Booking;
  onClose: () => void;
}

const ViewBookingModal = ({ booking, onClose }: ViewBookingModalProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content view-booking-modal">
        <div className="modal-header">
          <h2>Booking Details</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <section className="info-section">
            <h3>Guest Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                <p>
                  {booking.user?.firstName} {booking.user?.lastName}
                </p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{booking.user?.email}</p>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <p>{booking.user?.phoneNumber || "N/A"}</p>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h3>Booking Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Booking ID</label>
                <p className="id-text">{booking.id}</p>
              </div>
              <div className="info-item">
                <label>Type</label>
                <p>{booking.bookingType}</p>
              </div>
              <div className="info-item">
                <label>Entity</label>
                <p>
                  {booking.bookingType === "APARTMENT"
                    ? booking.apartment?.name
                    : `Room ${booking.room?.roomNumber}`}
                </p>
              </div>
              <div className="info-item">
                <label>Dates</label>
                <p>
                  {formatDate(booking.checkInDate)} -{" "}
                  {formatDate(booking.checkOutDate)}
                </p>
              </div>
              <div className="info-item">
                <label>Guests</label>
                <p>{booking.numberOfGuests}</p>
              </div>
              <div className="info-item">
                <label>Status</label>
                <span
                  className={`status-badge ${booking.status.toLowerCase()}`}
                >
                  {booking.status}
                </span>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h3>Payment Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Amount</label>
                <p className="amount">
                  {booking.paymentAmount} {booking.paymentCurrency}
                </p>
              </div>
              <div className="info-item">
                <label>Method</label>
                <p>{booking.paymentMethod}</p>
              </div>
              <div className="info-item">
                <label>Status</label>
                <span
                  className={`payment-badge ${booking.paymentStatus.toLowerCase()}`}
                >
                  {booking.paymentStatus}
                </span>
              </div>
              <div className="info-item">
                <label>Transaction ID</label>
                <p className="id-text">
                  {booking.paymentTransactionId || "N/A"}
                </p>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h3>Hotel Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Hotel Name</label>
                <p>{booking.hotel?.name}</p>
              </div>
              <div className="info-item">
                <label>Location</label>
                <p>
                  {booking.hotel?.city}, {booking.hotel?.country}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button className="close-btn-footer" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewBookingModal;
