import { Link } from "react-router-dom";
import { useGetFeaturedHotelsQuery } from "../../../hotels/slice/HotelSlice";
import Loader from "../../../../components/loader/Loader";
import "./featuredHotels.scss";

const FeaturedHotels = () => {
  const { data: hotels, isLoading, error } = useGetFeaturedHotelsQuery();

  if (isLoading) {
    return (
      <section className="featured-hotels">
        <div className="featured-hotels__container">
          <Loader text="Loading featured hotels..." />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-hotels">
        <div className="featured-hotels__container">
          <div className="featured-hotels__error">
            Failed to load featured hotels. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  if (!hotels || hotels.length === 0) {
    return (
      <section className="featured-hotels">
        <div className="featured-hotels__container">
          <div className="featured-hotels__empty">
            No featured hotels available at the moment.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-hotels">
      <div className="featured-hotels__container">
        <div className="featured-hotels__header">
          <h2 className="featured-hotels__title">Featured Hotels</h2>
          <p className="featured-hotels__subtitle">
            Handpicked luxury accommodations for an unforgettable experience
          </p>
        </div>

        <div className="featured-hotels__grid">
          {hotels.map((hotel) => (
            <Link
              key={hotel.id}
              to={`/hotels/${hotel.id}`}
              className="featured-hotels__card"
            >
              <div className="featured-hotels__image-wrapper">
                <img
                  src={
                    hotel.images && hotel.images.length > 0
                      ? hotel.images[0]
                      : "https://via.placeholder.com/800x500?text=Hotel"
                  }
                  alt={hotel.name}
                  className="featured-hotels__image"
                />
              </div>

              <div className="featured-hotels__content">
                <h3 className="featured-hotels__name">{hotel.name}</h3>

                <div className="featured-hotels__location">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {hotel.city}, {hotel.country}
                </div>

                {hotel.description && (
                  <p className="featured-hotels__description">
                    {hotel.description}
                  </p>
                )}

                <div className="featured-hotels__footer">
                  <div className="featured-hotels__rating">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    {hotel.rating ? Number(hotel.rating).toFixed(1) : "N/A"}
                  </div>
                  <span className="featured-hotels__cta">View Details</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedHotels;
