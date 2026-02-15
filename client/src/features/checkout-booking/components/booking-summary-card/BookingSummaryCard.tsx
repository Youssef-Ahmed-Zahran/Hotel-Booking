import "./bookingSummaryCard.scss";

interface BookingSummaryCardProps {
  hotelName?: string;
  accommodationName: string;
  accommodationType: "APARTMENT" | "ROOM";
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  pricePerNight: number;
  nights: number;
}

const BookingSummaryCard = ({
  hotelName,
  accommodationName,
  accommodationType,
  checkInDate,
  checkOutDate,
  numberOfGuests,
  pricePerNight,
  nights,
}: BookingSummaryCardProps) => {
  const subtotal = pricePerNight * nights;
  const serviceFee = subtotal * 0.005; // 0.5% service fee
  const tax = subtotal * 0.005; // 0.5% tax
  const total = subtotal + serviceFee + tax;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="booking-summary-card">
      <div className="booking-summary-card__header">
        <svg
          className="booking-summary-card__header-icon"
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
        <h3 className="booking-summary-card__title">Booking Summary</h3>
      </div>

      <div className="booking-summary-card__section">
        <div className="booking-summary-card__section-header">
          <svg
            className="booking-summary-card__icon"
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
          <h4 className="booking-summary-card__section-title">Accommodation</h4>
        </div>
        {hotelName && (
          <p className="booking-summary-card__hotel">{hotelName}</p>
        )}
        <p className="booking-summary-card__accommodation">
          {accommodationName}
        </p>
        <span className="booking-summary-card__type">
          {accommodationType === "APARTMENT" ? "🏢 Apartment" : "🛏️ Room"}
        </span>
      </div>

      <div className="booking-summary-card__section">
        <div className="booking-summary-card__section-header">
          <svg
            className="booking-summary-card__icon"
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
          <h4 className="booking-summary-card__section-title">Dates</h4>
        </div>
        <div className="booking-summary-card__dates">
          <div className="booking-summary-card__date">
            <span className="booking-summary-card__date-label">Check-in</span>
            <span className="booking-summary-card__date-value">
              {formatDate(checkInDate)}
            </span>
          </div>
          <div className="booking-summary-card__date-divider">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>
          <div className="booking-summary-card__date">
            <span className="booking-summary-card__date-label">Check-out</span>
            <span className="booking-summary-card__date-value">
              {formatDate(checkOutDate)}
            </span>
          </div>
        </div>
        <div className="booking-summary-card__nights">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
          <span>
            {nights} {nights === 1 ? "night" : "nights"}
          </span>
        </div>
      </div>

      <div className="booking-summary-card__section">
        <div className="booking-summary-card__section-header">
          <svg
            className="booking-summary-card__icon"
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
          <h4 className="booking-summary-card__section-title">Guests</h4>
        </div>
        <p className="booking-summary-card__guests">
          {numberOfGuests} {numberOfGuests === 1 ? "Guest" : "Guests"}
        </p>
      </div>

      <div className="booking-summary-card__section booking-summary-card__section--highlight">
        <div className="booking-summary-card__section-header">
          <svg
            className="booking-summary-card__icon"
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
          <h4 className="booking-summary-card__section-title">
            Price Breakdown
          </h4>
        </div>
        <div className="booking-summary-card__price-breakdown">
          <div className="booking-summary-card__price-row">
            <span>
              ${Number(pricePerNight).toFixed(2)} × {nights}{" "}
              {nights === 1 ? "night" : "nights"}
            </span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="booking-summary-card__price-row">
            <span>Service fee</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          <div className="booking-summary-card__price-row">
            <span>Taxes</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="booking-summary-card__price-row booking-summary-card__price-row--total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummaryCard;
