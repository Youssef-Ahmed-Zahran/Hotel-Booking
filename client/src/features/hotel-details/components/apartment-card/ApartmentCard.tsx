import { Link } from "react-router-dom";
import type { Apartment } from "../../../../types";
import "./apartmentCard.scss";

interface ApartmentCardProps {
  apartment: Apartment;
}

const ApartmentCard = ({ apartment }: ApartmentCardProps) => {
  const mainImage =
    apartment.images?.[0] ||
    "https://via.placeholder.com/400x300?text=Apartment";

  return (
    <div className="apartment-card">
      <img
        src={mainImage}
        alt={apartment.name}
        className="apartment-card__image"
      />

      <div className="apartment-card__content">
        <h3 className="apartment-card__name">{apartment.name}</h3>

        <div className="apartment-card__details">
          <div className="apartment-card__detail">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V7H1v10h22v-6c0-2.21-1.79-4-4-4z" />
            </svg>
            {apartment.numberOfBedrooms} Bedrooms
          </div>
          <div className="apartment-card__detail">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            {apartment.numberOfBathrooms} Bathrooms
          </div>
          <div className="apartment-card__detail">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            {apartment.totalCapacity} Guests
          </div>
        </div>

        {apartment.description && (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            {apartment.description}
          </p>
        )}

        <div className="apartment-card__footer">
          <div className="apartment-card__price">
            ${apartment.pricePerNight} <span>/night</span>
          </div>
          <Link
            to={`/apartments/${apartment.id}`}
            className="apartment-card__btn"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ApartmentCard;
