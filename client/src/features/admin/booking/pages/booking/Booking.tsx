import { useState, lazy, Suspense } from "react";
import "./booking.scss";
import {
  useGetAllBookingsQuery,
  useGetGlobalBookingStatsQuery,
  useCancelBookingMutation,
} from "../../../../my-bookings/slice/BookingSlice";
import type { Booking } from "../../../../../types";
import Loader from "../../../../../components/loader/Loader";

const UpdateBookingModal = lazy(
  () => import("../../components/update-booking/UpdateBooking")
);
const ViewBookingModal = lazy(
  () => import("../../components/view-booking/ViewBooking")
);

import { toast } from "react-hot-toast";
import { useInfiniteScroll } from "../../../../../hooks/useInfiniteScroll";
import InfiniteScrollFooter from "../../../../../components/infinite-scroll-footer/InfiniteScrollFooter";

const BookingPage = () => {
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  const { data: bookingsData, isLoading } = useGetAllBookingsQuery({
    page,
    limit: 10,
    status: filterStatus as any,
  });

  const { data: statsData } = useGetGlobalBookingStatsQuery();
  const [cancelBooking] = useCancelBookingMutation();

  const bookings = bookingsData?.bookings || [];
  const hasMore = bookingsData
    ? page < bookingsData.pagination.totalPages
    : false;

  const observerTarget = useInfiniteScroll({
    onLoadMore: () => setPage((prev) => prev + 1),
    hasMore,
    isLoading,
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  const handleEditClick = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleViewClick = (booking: Booking) => {
    setViewingBooking(booking);
  };

  const handleCancelClick = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await cancelBooking(bookingId).unwrap();
        toast.success("Booking cancelled successfully");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to cancel booking");
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedBooking(null);
    setViewingBooking(null);
  };

  return (
    <div className="bookings-container">
      <div className="header">
        <h1>Bookings Management</h1>
        <div className="header-actions"></div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Bookings</h3>
            <p>{statsData?.totalBookings || 0}</p>
          </div>
          <div className="stat-icon b-total">📅</div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p>{statsData?.totalRevenue?.toLocaleString()} USD</p>
          </div>
          <div className="stat-icon b-revenue">💰</div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Confirmed</h3>
            <p>
              {statsData?.bookingsByStatus?.find(
                (s: any) => s.status === "CONFIRMED"
              )?.count || 0}
            </p>
          </div>
          <div className="stat-icon b-confirmed">✅</div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Pending</h3>
            <p>
              {statsData?.bookingsByStatus?.find(
                (s: any) => s.status === "PENDING"
              )?.count || 0}
            </p>
          </div>
          <div className="stat-icon b-pending">⏳</div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <label>Status Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="status-filter"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div className="results-count">
          Showing {bookings.length} of {bookingsData?.pagination.total || 0}{" "}
          bookings
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      ) : (
        <>
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Booking Info</th>
                  <th>Stay Dates</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="no-data">
                      No bookings found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking: Booking) => (
                    <tr key={booking.id}>
                      <td className="user-cell">
                        <div className="user-info">
                          <span className="user-name">
                            {booking.user?.firstName} {booking.user?.lastName}
                          </span>
                          <span className="user-email">
                            {booking.user?.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="booking-type-info">
                          <span className="type-tag">
                            {booking.bookingType}
                          </span>
                          <span className="entity-name">
                            {booking.bookingType === "APARTMENT"
                              ? booking.apartment?.name
                              : `Room ${booking.room?.roomNumber}`}
                          </span>
                        </div>
                      </td>
                      <td className="dates-cell">
                        <span className="date-range">
                          {formatDate(booking.checkInDate)} -{" "}
                          {formatDate(booking.checkOutDate)}
                        </span>
                      </td>
                      <td className="amount-cell">
                        <span className="price">
                          {booking.paymentAmount} {booking.paymentCurrency}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${booking.status.toLowerCase()}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`payment-badge ${booking.paymentStatus.toLowerCase()}`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <button
                            className="action-btn view"
                            onClick={() => handleViewClick(booking)}
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            className="action-btn edit"
                            onClick={() => handleEditClick(booking)}
                            title="Edit Status"
                          >
                            ✏️
                          </button>
                          {booking.status !== "CANCELLED" && (
                            <button
                              className="action-btn cancel"
                              onClick={() => handleCancelClick(booking.id)}
                              title="Cancel Booking"
                            >
                              ❌
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {bookingsData?.pagination && (
            <InfiniteScrollFooter
              isFetching={isLoading}
              hasMore={hasMore}
              observerRef={observerTarget as any}
              endMessage="No more bookings found."
            />
          )}
        </>
      )}

      {selectedBooking && (
        <Suspense fallback={<Loader />}>
          <UpdateBookingModal
            bookingId={selectedBooking.id}
            currentStatus={selectedBooking.status}
            currentPaymentStatus={selectedBooking.paymentStatus}
            onClose={handleCloseModal}
          />
        </Suspense>
      )}

      {viewingBooking && (
        <Suspense fallback={<Loader />}>
          <ViewBookingModal
            booking={viewingBooking}
            onClose={handleCloseModal}
          />
        </Suspense>
      )}
    </div>
  );
};

export default BookingPage;
