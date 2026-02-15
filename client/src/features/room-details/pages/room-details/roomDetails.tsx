import { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { useGetRoomQuery } from "../../../admin/rooms/slice/roomSlice";
import Loader from "../../../../components/loader/Loader";

const CreateBooking = lazy(
  () => import("../../../hotel-details/components/create-booking/CreateBooking")
);

import "./roomDetails.scss";

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: room, isLoading, error } = useGetRoomQuery(id!);

  if (isLoading) {
    return <Loader fullscreen text="Loading room details..." />;
  }

  if (error || !room) {
    return (
      <div className="room-details">
        <div className="room-details__container">
          <div className="room-details__error">
            Failed to load room details. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  // Prepare images for gallery display
  const images = room.images && room.images.length > 0 ? room.images : [];
  const placeholderImages = [
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  ];
  const displayImages = images.length > 0 ? images : placeholderImages;

  // Placeholder amenities if none provided
  const amenities =
    room.amenities && room.amenities.length > 0
      ? room.amenities
      : [
          "Wi-Fi",
          "Air Conditioning",
          "TV",
          "Private Bathroom",
          "Daily Housekeeping",
        ];

  return (
    <div className="room-details">
      <div className="room-details__container">
        <div className="room-details__gallery">
          {displayImages.slice(0, 3).map((img, index) => (
            <div key={index} className="room-details__gallery-item">
              <img src={img} alt={`${room.roomNumber} - Image ${index + 1}`} />
            </div>
          ))}
        </div>

        <div className="room-details__content">
          <div className="room-details__main">
            <div className="room-details__header">
              <div>
                <span className="room-details__type">{room.roomType}</span>
                <h1 className="room-details__title">Room {room.roomNumber}</h1>
              </div>
              <div className="room-details__price">
                <div className="room-details__price-amount">
                  ${room.pricePerNight}
                </div>
                <div className="room-details__price-period">per night</div>
              </div>
            </div>

            <div className="room-details__info-grid">
              <div className="room-details__info-item">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
                <span>{room.capacity} Guests</span>
              </div>
              <div className="room-details__info-item">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 10V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v3c-1.1 0-2 .9-2 2v5h1.33L4 19h1l.67-2h12.67l.66 2h1l.67-2H22v-5c0-1.1-.9-2-2-2zm-9 0H7V7h4v3zm5 0h-4V7h4v3z" />
                </svg>
                <span>King Bed</span>
              </div>
              <div className="room-details__info-item">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 4H7L2 20h19c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7 18l4-12.86L12.86 18H7z" />
                </svg>
                <span>City View</span>
              </div>
            </div>

            <div className="room-details__amenities">
              <h3 className="room-details__amenities-title">Amenities</h3>
              <div className="room-details__amenities-list">
                {amenities.map((amenity, index) => (
                  <div key={index} className="room-details__amenities-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    <span>
                      {typeof amenity === "string" ? amenity : amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="room-details__sidebar">
            <Suspense fallback={<Loader />}>
              <CreateBooking
                hotelId={room.hotelId || room.apartmentId || ""}
                roomId={room.id}
                pricePerNight={room.pricePerNight}
                bookingType="ROOM"
                maxGuests={room.capacity}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
