import { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { useGetApartmentQuery } from "../../../admin/apartments/slice/apartmentSlice";
import { useGetRoomsByApartmentQuery } from "../../../admin/rooms/slice/roomSlice";
import Loader from "../../../../components/loader/Loader";
import RoomCard from "../../../hotel-details/components/room-card/RoomCard";

const CreateBooking = lazy(
  () => import("../../../hotel-details/components/create-booking/CreateBooking")
);

import "./apartmentDetails.scss";

const ApartmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: apartment, isLoading, error } = useGetApartmentQuery(id!);
  const { data: rooms } = useGetRoomsByApartmentQuery(id!, { skip: !id });

  if (isLoading) {
    return <Loader fullscreen text="Loading apartment details..." />;
  }

  if (error || !apartment) {
    return (
      <div className="apartment-details">
        <div className="apartment-details__container">
          <div className="apartment-details__error">
            Failed to load apartment details. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  // Placeholder images for gallery if only one image exists
  const images =
    apartment.images && apartment.images.length > 0 ? apartment.images : [];
  const placeholderImages = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  ];
  const displayImages = images.length > 0 ? images : placeholderImages;

  return (
    <div className="apartment-details">
      <div className="apartment-details__container">
        <div className="apartment-details__gallery">
          {displayImages.slice(0, 3).map((img, index) => (
            <div key={index} className="apartment-details__gallery-item">
              <img src={img} alt={`${apartment.name} ${index + 1}`} />
            </div>
          ))}
        </div>

        <div className="apartment-details__content">
          <div className="apartment-details__main">
            <div className="apartment-details__header">
              <div>
                <h1 className="apartment-details__title">{apartment.name}</h1>
                <div className="apartment-details__location">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span>Excellent Location</span>
                </div>
              </div>
              <div className="apartment-details__price">
                <div className="apartment-details__price-amount">
                  ${apartment.pricePerNight}
                </div>
                <div className="apartment-details__price-period">per night</div>
              </div>
            </div>

            <div className="apartment-details__section">
              <h2 className="apartment-details__section-title">
                About this apartment
              </h2>
              <p className="apartment-details__description">
                {apartment.description ||
                  "Experience luxury living in this beautifully appointed apartment. Featuring modern amenities, spacious interiors, and stunning views, it provides the perfect home away from home for your stay."}
              </p>
            </div>

            {rooms && rooms.length > 0 && (
              <div className="apartment-details__section">
                <h2 className="apartment-details__section-title">
                  Rooms in this Apartment
                </h2>
                <div className="apartment-details__rooms-grid">
                  {rooms.map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="apartment-details__sidebar">
            <Suspense fallback={<Loader />}>
              <CreateBooking
                hotelId={apartment.hotelId}
                apartmentId={apartment.id}
                pricePerNight={apartment.pricePerNight}
                bookingType="APARTMENT"
                maxGuests={apartment.totalCapacity}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentDetails;
