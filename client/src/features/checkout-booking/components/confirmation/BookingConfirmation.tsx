import { Link } from "react-router-dom";
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
      <div className="booking-confirmation__success">
        <div className="booking-confirmation__icon-wrapper">
          <div className="booking-confirmation__icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <div className="booking-confirmation__confetti">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`booking-confirmation__confetti-piece booking-confirmation__confetti-piece--${
                  i + 1
                }`}
              />
            ))}
          </div>
        </div>
        <h1 className="booking-confirmation__title">Booking Confirmed!</h1>
        <p className="booking-confirmation__subtitle">
          Thank you for your booking. A confirmation email has been sent to{" "}
          <strong>{guestEmail}</strong>
        </p>
      </div>

      <div className="booking-confirmation__details">
        <div className="booking-confirmation__section">
          <div className="booking-confirmation__section-header">
            <svg
              className="booking-confirmation__section-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
              />
            </svg>
            <h2 className="booking-confirmation__section-title">
              Booking Reference
            </h2>
          </div>
          <div className="booking-confirmation__reference">
            <span className="booking-confirmation__booking-id">
              {bookingId}
            </span>
            <p className="booking-confirmation__hint">
              Please save this reference number for your records
            </p>
          </div>
        </div>

        <div className="booking-confirmation__section">
          <div className="booking-confirmation__section-header">
            <svg
              className="booking-confirmation__section-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h2 className="booking-confirmation__section-title">
              Booking Details
            </h2>
          </div>
          <div className="booking-confirmation__info-grid">
            <div className="booking-confirmation__info-item">
              <svg
                className="booking-confirmation__info-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <div>
                <span className="booking-confirmation__info-label">
                  Accommodation
                </span>
                <span className="booking-confirmation__info-value">
                  {accommodationName}
                </span>
              </div>
            </div>
            <div className="booking-confirmation__info-item">
              <svg
                className="booking-confirmation__info-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <div>
                <span className="booking-confirmation__info-label">
                  Guest Name
                </span>
                <span className="booking-confirmation__info-value">
                  {guestName}
                </span>
              </div>
            </div>
            <div className="booking-confirmation__info-item">
              <svg
                className="booking-confirmation__info-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <span className="booking-confirmation__info-label">
                  Check-in
                </span>
                <span className="booking-confirmation__info-value">
                  {formatDate(checkInDate)}
                </span>
              </div>
            </div>
            <div className="booking-confirmation__info-item">
              <svg
                className="booking-confirmation__info-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <span className="booking-confirmation__info-label">
                  Check-out
                </span>
                <span className="booking-confirmation__info-value">
                  {formatDate(checkOutDate)}
                </span>
              </div>
            </div>
            <div className="booking-confirmation__info-item">
              <svg
                className="booking-confirmation__info-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <div>
                <span className="booking-confirmation__info-label">Guests</span>
                <span className="booking-confirmation__info-value">
                  {numberOfGuests} {numberOfGuests === 1 ? "Guest" : "Guests"}
                </span>
              </div>
            </div>
            <div className="booking-confirmation__info-item booking-confirmation__info-item--highlight">
              <svg
                className="booking-confirmation__info-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <span className="booking-confirmation__info-label">
                  Total Amount
                </span>
                <span className="booking-confirmation__info-value booking-confirmation__info-value--price">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="booking-confirmation__section">
          <div className="booking-confirmation__section-header">
            <svg
              className="booking-confirmation__section-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <h2 className="booking-confirmation__section-title">Next Steps</h2>
          </div>
          <ul className="booking-confirmation__steps">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>You will receive a confirmation email shortly</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Check your email for detailed booking information</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Arrive at the property on your check-in date</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              <span>Have your booking reference ready at check-in</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="booking-confirmation__actions">
        <button
          onClick={handlePrint}
          className="booking-confirmation__btn booking-confirmation__btn--print"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print Booking
        </button>
        <Link
          to="/my-bookings"
          className="booking-confirmation__btn booking-confirmation__btn--primary"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          View My Bookings
        </Link>
        <Link
          to="/"
          className="booking-confirmation__btn booking-confirmation__btn--secondary"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmation;
