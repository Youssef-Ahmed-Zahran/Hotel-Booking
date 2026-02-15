import { Link } from "react-router-dom";
import type { Hotel } from "../../../../types";
import "./hotelCard.scss";

interface HotelCardProps {
  hotel: Hotel;
}

const HotelCard = ({ hotel }: HotelCardProps) => {
  return (
    <Link to={`/hotels/${hotel.id}`} className="hotel-card">
      <div className="hotel-card__image-wrapper">
        <img
          src={
            hotel.images && hotel.images.length > 0
              ? hotel.images[0]
              : "https://via.placeholder.com/800x500?text=Hotel"
          }
          alt={hotel.name}
          className="hotel-card__image"
        />
      </div>

      <div className="hotel-card__content">
        <div className="hotel-card__header">
          <h3 className="hotel-card__name">{hotel.name}</h3>
          <div className="hotel-card__rating">
            <svg viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            {hotel.rating ? Number(hotel.rating).toFixed(1) : "N/A"}
          </div>
        </div>

        <div className="hotel-card__location">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          {hotel.city}, {hotel.country}
        </div>

        {hotel.description && (
          <p className="hotel-card__description">{hotel.description}</p>
        )}

        <div className="hotel-card__footer">
          <div className="hotel-card__stats">
            {hotel._count?.apartments !== undefined && (
              <div className="hotel-card__stat">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                </svg>
                {hotel._count.apartments} Apartments
              </div>
            )}
            {hotel._count?.rooms !== undefined && (
              <div className="hotel-card__stat">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V7H1v10h22v-6c0-2.21-1.79-4-4-4z" />
                </svg>
                {hotel._count.rooms} Rooms
              </div>
            )}
          </div>
          <span className="hotel-card__cta">View Details</span>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
