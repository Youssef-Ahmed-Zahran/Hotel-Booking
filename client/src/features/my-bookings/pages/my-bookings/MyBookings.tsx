import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useGetCurrentUserQuery } from "../../../auth/slice/authSlice";
import { useGetUserBookingsQuery } from "../../slice/BookingSlice";
import BookingCard from "../../components/booking-card/BookingCard";
import Loader from "../../../../components/loader/Loader";
import "./myBookings.scss";

const MyBookings = () => {
  const { data: user } = useGetCurrentUserQuery();
  const [page, setPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching, error } = useGetUserBookingsQuery(
    {
      userId: user?.id || "",
      page,
      limit: 10,
    },
    {
      skip: !user?.id,
    }
  );

  const bookings = data?.bookings || [];
  const hasMore = data?.pagination
    ? data.pagination.page < data.pagination.totalPages
    : false;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isFetching]);

  if (isLoading && page === 1) {
    return <Loader fullscreen text="Loading your bookings..." />;
  }

  if (error) {
    return (
      <div className="my-bookings">
        <div className="my-bookings__container">
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--error)",
            }}
          >
            Failed to load bookings. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings">
      <div className="my-bookings__container">
        <div className="my-bookings__header">
          <h1 className="my-bookings__title">My Bookings</h1>
          <p className="my-bookings__subtitle">
            View and manage your hotel reservations
          </p>
        </div>

        {bookings && bookings.length > 0 ? (
          <div className="my-bookings__list">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
            {/* Loading indicator for next pages */}
            <div
              ref={observerTarget}
              style={{ height: "20px", marginTop: "2rem" }}
            >
              {isFetching && page > 1 && <Loader text="Loading more..." />}
            </div>
          </div>
        ) : (
          <div className="my-bookings__empty">
            <h3>No Bookings Yet</h3>
            <p>
              You haven't made any reservations. Start exploring our hotels!
            </p>
            <Link to="/hotels" className="my-bookings__cta">
              Browse Hotels
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
