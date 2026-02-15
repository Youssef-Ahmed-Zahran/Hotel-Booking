import { useState, lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Mail, Phone } from "lucide-react";
import { useGetHotelQuery } from "../../../hotels/slice/HotelSlice";
import { useGetApartmentsByHotelQuery } from "../../../admin/apartments/slice/apartmentSlice";
import { useGetRoomsByHotelQuery } from "../../../admin/rooms/slice/roomSlice";
import Loader from "../../../../components/loader/Loader";
import ApartmentCard from "../../components/apartment-card/ApartmentCard";
import RoomCard from "../../components/room-card/RoomCard";
import ReviewList from "../../components/review-list/ReviewList";
import Breadcrumbs from "../../../../components/breadcrumbs/Breadcrumbs";

const AddReview = lazy(() => import("../../components/add-review/AddReview"));

import "./hotelDetails.scss";

const HotelDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: hotel, isLoading, error } = useGetHotelQuery(id!);
  const { data: apartments } = useGetApartmentsByHotelQuery(id!);
  const { data: rooms } = useGetRoomsByHotelQuery(id!);

  const [activeTab, setActiveTab] = useState<
    "apartments" | "rooms" | "reviews"
  >("rooms");

  if (isLoading) {
    return <Loader fullscreen text="Loading hotel details..." />;
  }

  if (error || !hotel) {
    return (
      <div className="hotel-details">
        <div className="hotel-details__container">
          <div className="hotel-details__error">
            Failed to load hotel details. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  const images = hotel.images && hotel.images.length > 0 ? hotel.images : [];
  const placeholderImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400",
  ];
  const displayImages = images.length > 0 ? images : placeholderImages;

  const breadcrumbItems = [
    { label: "Hotels", path: "/hotels" },
    { label: hotel.name },
  ];

  const hasApartments = apartments && apartments.length > 0;
  const hasRooms = rooms && rooms.length > 0;

  // Set default tab if one type is empty
  if (hasApartments && !hasRooms && activeTab !== "apartments") {
    setActiveTab("apartments");
  }

  return (
    <div className="hotel-details">
      <div className="hotel-details__container">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="hotel-details__gallery-section">
          <div
            className={`hotel-details__gallery hotel-details__gallery--${displayImages.length}`}
          >
            {displayImages.slice(0, 5).map((img, index) => (
              <div
                key={index}
                className={`hotel-details__gallery-item ${
                  index === 0 ? "hotel-details__gallery-item--large" : ""
                }`}
              >
                <img src={img} alt={`${hotel.name} ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="hotel-details__content">
          <div className="hotel-details__main-content">
            <div className="hotel-details__hero">
              <header className="hotel-details__header">
                <div className="hotel-details__title-group">
                  <h1 className="hotel-details__name">{hotel.name}</h1>
                  <div className="hotel-details__location">
                    <MapPin size={18} />
                    <span>
                      {hotel.address}, {hotel.city}, {hotel.country}
                    </span>
                  </div>
                </div>

                <div className="hotel-details__header-actions">
                  <div className="hotel-details__rating-badge">
                    <div className="hotel-details__rating-score">
                      {hotel.rating ? Number(hotel.rating).toFixed(1) : "N/A"}
                    </div>
                    <div className="hotel-details__rating-text">
                      <span className="hotel-details__rating-label">
                        {Number(hotel.rating) >= 4.5
                          ? "Superb"
                          : Number(hotel.rating) >= 4
                          ? "Excellent"
                          : "Good"}
                      </span>
                      <span className="hotel-details__rating-count">
                        {hotel._count?.reviews || 0} reviews
                      </span>
                    </div>
                  </div>
                </div>
              </header>
            </div>

            {hotel.description && (
              <div className="hotel-details__section-card">
                <h2>Overview</h2>
                <div className="hotel-details__description">
                  {hotel.description}
                </div>
              </div>
            )}

            <div
              className={`hotel-details__section-card ${
                activeTab === "reviews" ? "hotel-details__reviews-section" : ""
              }`}
            >
              <div className="hotel-details__tabs">
                {hasRooms && (
                  <button
                    className={`hotel-details__tab ${
                      activeTab === "rooms" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("rooms")}
                  >
                    Rooms
                  </button>
                )}
                {hasApartments && (
                  <button
                    className={`hotel-details__tab ${
                      activeTab === "apartments" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("apartments")}
                  >
                    Apartments
                  </button>
                )}
                <button
                  className={`hotel-details__tab ${
                    activeTab === "reviews" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("reviews")}
                >
                  Reviews ({hotel._count?.reviews || 0})
                </button>
              </div>

              <div className="hotel-details__tab-content">
                {activeTab === "rooms" && hasRooms && (
                  <div className="hotel-details__list">
                    {rooms.map((room) => (
                      <RoomCard key={room.id} room={room} />
                    ))}
                  </div>
                )}
                {activeTab === "apartments" && hasApartments && (
                  <div className="hotel-details__list">
                    {apartments.map((apartment) => (
                      <ApartmentCard key={apartment.id} apartment={apartment} />
                    ))}
                  </div>
                )}
                {activeTab === "reviews" && (
                  <div className="hotel-details__reviews-tab">
                    <ReviewList hotelId={id!} />
                    <Suspense fallback={<Loader />}>
                      <AddReview hotelId={id!} />
                    </Suspense>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hotel-details__sidebar">
            <div className="contact-card">
              <div className="contact-card__header">
                <div className="contact-card__badge">24/7 Available</div>
                <h3 className="contact-card__title">Contact Support</h3>
                <p className="contact-card__subtitle">
                  Our team is here to help with your booking
                </p>
              </div>

              <div className="contact-list">
                {hotel.email && (
                  <a href={`mailto:${hotel.email}`} className="contact-item">
                    <div className="icon-box">
                      <Mail size={22} />
                    </div>
                    <div className="info">
                      <label>Email Us</label>
                      <span>{hotel.email}</span>
                    </div>
                  </a>
                )}
                {hotel.phoneNumber && (
                  <a href={`tel:${hotel.phoneNumber}`} className="contact-item">
                    <div className="icon-box">
                      <Phone size={22} />
                    </div>
                    <div className="info">
                      <label>Call Us</label>
                      <span>{hotel.phoneNumber}</span>
                    </div>
                  </a>
                )}
                <div className="contact-item">
                  <div className="icon-box">
                    <MapPin size={22} />
                  </div>
                  <div className="info">
                    <label>Our Location</label>
                    <span>
                      {hotel.address}, {hotel.city}, {hotel.country}
                    </span>
                  </div>
                </div>
              </div>

              <button className="contact-card__btn">
                <Mail size={18} />
                <span>Send a Message</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
