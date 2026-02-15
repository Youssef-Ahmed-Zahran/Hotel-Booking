import { Link } from "react-router-dom";
import type { Room } from "../../../../types";
import "./roomCard.scss";

interface RoomCardProps {
  room: Room;
}

const RoomCard = ({ room }: RoomCardProps) => {
  const mainImage =
    room.images?.[0] || "https://via.placeholder.com/400x300?text=Room";

  return (
    <div className="room-card">
      <img src={mainImage} alt={room.roomNumber} className="room-card__image" />

      <div className="room-card__content">
        <div className="room-card__header">
          <h3 className="room-card__name">Room {room.roomNumber}</h3>
          <span className="room-card__type">{room.roomType}</span>
        </div>

        <div className="room-card__details">
          <div className="room-card__detail">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            {room.capacity} Guests
          </div>
          <div className="room-card__detail">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            {room.isAvailable ? "Available" : "Booked"}
          </div>
        </div>

        {room.description && (
          <p className="room-card__description">{room.description}</p>
        )}

        <div className="room-card__footer">
          <div className="room-card__price">
            ${room.pricePerNight} <span>/night</span>
          </div>
          <Link to={`/rooms/${room.id}`} className="room-card__btn">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
