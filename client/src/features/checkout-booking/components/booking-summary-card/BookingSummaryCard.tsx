import {
  Hotel,
  Calendar,
  Users,
  CreditCard,
  Building2,
  BedDouble,
  Clock,
  ChevronRight
} from "lucide-react";
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
        <div className="booking-summary-card__header-content">
          <h3 className="booking-summary-card__title">Booking Summary</h3>
          <span className="booking-summary-card__subtitle">Review your stay details</span>
        </div>
      </div>

      <div className="booking-summary-card__content">
        <div className="booking-summary-card__section">
          <div className="booking-summary-card__section-header">
            <Hotel className="booking-summary-card__icon" />
            <h4 className="booking-summary-card__section-title">Accommodation</h4>
          </div>
          <div className="booking-summary-card__info-group">
            {hotelName && (
              <p className="booking-summary-card__hotel">{hotelName}</p>
            )}
            <p className="booking-summary-card__accommodation">
              {accommodationName}
            </p>
            <div className="booking-summary-card__type">
              {accommodationType === "APARTMENT" ? (
                <Building2 size={14} />
              ) : (
                <BedDouble size={14} />
              )}
              <span>{accommodationType === "APARTMENT" ? "Apartment" : "Room"}</span>
            </div>
          </div>
        </div>

        <div className="booking-summary-card__section">
          <div className="booking-summary-card__section-header">
            <Calendar className="booking-summary-card__icon" />
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
              <ChevronRight size={16} />
            </div>
            <div className="booking-summary-card__date">
              <span className="booking-summary-card__date-label">Check-out</span>
              <span className="booking-summary-card__date-value">
                {formatDate(checkOutDate)}
              </span>
            </div>
          </div>
          <div className="booking-summary-card__nights">
            <Clock size={14} />
            <span>
              {nights} {nights === 1 ? "night" : "nights"}
            </span>
          </div>
        </div>

        <div className="booking-summary-card__section">
          <div className="booking-summary-card__section-header">
            <Users className="booking-summary-card__icon" />
            <h4 className="booking-summary-card__section-title">Guests</h4>
          </div>
          <p className="booking-summary-card__guests">
            {numberOfGuests} {numberOfGuests === 1 ? "Guest" : "Guests"}
          </p>
        </div>

        <div className="booking-summary-card__section booking-summary-card__section--highlight">
          <div className="booking-summary-card__section-header">
            <CreditCard className="booking-summary-card__icon" />
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
              <span className="total-amount">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummaryCard;
