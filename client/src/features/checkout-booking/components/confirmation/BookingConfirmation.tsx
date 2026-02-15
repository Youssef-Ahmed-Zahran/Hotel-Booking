import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Printer,
  LayoutDashboard,
  Home,
  Calendar,
  Users,
  Receipt,
  Building2,
  User,
  Mail,
  Hash
} from "lucide-react";
import "./bookingConfirmation.scss";

interface BookingConfirmationProps {
  bookingId: string;
  accommodationName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalAmount: number;
  guestName: string;
  guestEmail: string;
}

const BookingConfirmation = ({
  bookingId,
  accommodationName,
  checkInDate,
  checkOutDate,
  numberOfGuests,
  totalAmount,
  guestName,
  guestEmail,
}: BookingConfirmationProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="booking-confirmation">
      <div className="booking-confirmation__hero">
        <div className="booking-confirmation__success-wrapper">
          <div className="booking-confirmation__icon-container">
            <CheckCircle2 className="booking-confirmation__success-icon" />
            <div className="booking-confirmation__glow" />
            <div className="booking-confirmation__confetti">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`booking-confirmation__confetti-piece booking-confirmation__confetti-piece--${i + 1
                    }`}
                />
              ))}
            </div>
          </div>
          <h1 className="booking-confirmation__title">Booking Confirmed!</h1>
          <p className="booking-confirmation__subtitle">
            Your stay at <strong>{accommodationName}</strong> is all set.
            We've sent a confirmation email to <strong>{guestEmail}</strong>.
          </p>
        </div>
      </div>

      <div className="booking-confirmation__content">
        <div className="booking-confirmation__main-details">
          <div className="booking-confirmation__card booking-confirmation__card--reference">
            <div className="booking-confirmation__card-header">
              <Hash className="booking-confirmation__card-icon" />
              <h3>Booking Reference</h3>
            </div>
            <div className="booking-confirmation__reference-value">
              <span>{bookingId}</span>
              <p>Keep this code for your check-in and records</p>
            </div>
          </div>

          <div className="booking-confirmation__card booking-confirmation__card--trip">
            <div className="booking-confirmation__card-header">
              <Calendar className="booking-confirmation__card-icon" />
              <h3>Your Stay Details</h3>
            </div>
            <div className="booking-confirmation__details-grid">
              <div className="booking-confirmation__detail-item">
                <Building2 className="booking-confirmation__detail-icon" />
                <div className="booking-confirmation__detail-text">
                  <label>Accommodation</label>
                  <span>{accommodationName}</span>
                </div>
              </div>
              <div className="booking-confirmation__detail-item">
                <User className="booking-confirmation__detail-icon" />
                <div className="booking-confirmation__detail-text">
                  <label>Guest Name</label>
                  <span>{guestName}</span>
                </div>
              </div>
              <div className="booking-confirmation__detail-item">
                <Calendar className="booking-confirmation__detail-icon" />
                <div className="booking-confirmation__detail-text">
                  <label>Check-in</label>
                  <span>{formatDate(checkInDate)}</span>
                </div>
              </div>
              <div className="booking-confirmation__detail-item">
                <Calendar className="booking-confirmation__detail-icon" />
                <div className="booking-confirmation__detail-text">
                  <label>Check-out</label>
                  <span>{formatDate(checkOutDate)}</span>
                </div>
              </div>
              <div className="booking-confirmation__detail-item">
                <Users className="booking-confirmation__detail-icon" />
                <div className="booking-confirmation__detail-text">
                  <label>Guests</label>
                  <span>{numberOfGuests} {numberOfGuests === 1 ? "Guest" : "Guests"}</span>
                </div>
              </div>
              <div className="booking-confirmation__detail-item booking-confirmation__detail-item--price">
                <Receipt className="booking-confirmation__detail-icon" />
                <div className="booking-confirmation__detail-text">
                  <label>Total Paid</label>
                  <span className="price">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="booking-confirmation__sidebar">
          <div className="booking-confirmation__card booking-confirmation__card--steps">
            <div className="booking-confirmation__card-header">
              <CheckCircle2 className="booking-confirmation__card-icon" />
              <h3>Next Steps</h3>
            </div>
            <ul className="booking-confirmation__steps-list">
              <li>
                <div className="step-number">1</div>
                <div className="step-content">
                  <Mail className="step-icon" />
                  <p>Check your email for the receipt and check-in instructions.</p>
                </div>
              </li>
              <li>
                <div className="step-number">2</div>
                <div className="step-content">
                  <Building2 className="step-icon" />
                  <p>Save the property address to your map for easy navigation.</p>
                </div>
              </li>
              <li>
                <div className="step-number">3</div>
                <div className="step-content">
                  <User className="step-icon" />
                  <p>Present your reference ID <strong>{bookingId}</strong> upon arrival.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="booking-confirmation__actions">
            <button
              onClick={handlePrint}
              className="booking-confirmation__btn booking-confirmation__btn--print"
            >
              <Printer className="btn-icon" />
              <span>Print Details</span>
            </button>
            <Link
              to="/my-bookings"
              className="booking-confirmation__btn booking-confirmation__btn--primary"
            >
              <LayoutDashboard className="btn-icon" />
              <span>Manage Bookings</span>
            </Link>
            <Link
              to="/"
              className="booking-confirmation__btn booking-confirmation__btn--secondary"
            >
              <Home className="btn-icon" />
              <span>Return Home</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BookingConfirmation;
