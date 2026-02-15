import { useState } from "react";
import "./reviews.scss";
import {
  useGetAllReviewsQuery,
  useDeleteReviewMutation,
} from "../../slice/reviewSlice";
import type { Review } from "../../../../../types";
import { useInfiniteScroll } from "../../../../../hooks/useInfiniteScroll";
import InfiniteScrollFooter from "../../../../../components/infinite-scroll-footer/InfiniteScrollFooter";

const Reviews = () => {
  const [page, setPage] = useState(1);

  const {
    data: reviewsData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetAllReviewsQuery({
    page,
    limit: 10,
  });

  const reviews = reviewsData?.reviews || [];
  const hasMore = reviewsData?.pagination
    ? page < reviewsData.pagination.totalPages
    : false;

  const [deleteReview] = useDeleteReviewMutation();

  const loadMore = () => {
    if (hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const scrollTargetRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isFetching,
  });

  const handleDelete = async (id: string, hotelId?: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      await deleteReview({ reviewId: id, hotelId });
    }
  };

  return (
    <div className="reviews-container">
      <div className="header">
        <div className="title-section">
          <h1>Reviews Management</h1>
          <p className="subtitle">Monitor and manage all customer feedback</p>
        </div>
      </div>

      {isLoading && page === 1 ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Fetching reviews...</p>
        </div>
      ) : isError ? (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Failed to load reviews</h3>
          <p>
            {(error as any)?.data?.message ||
              "An unexpected error occurred. Please try again later."}
          </p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : (
        <>
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No reviews found</h3>
                <p>There are no customer reviews at this time.</p>
              </div>
            ) : (
              reviews.map((review: Review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-meta">
                      <div className="rating">★ {review.rating}</div>
                      <span className="type-badge">{review.reviewType}</span>
                    </div>
                    <div className="user-info">
                      <span className="name">
                        {review.user?.firstName} {review.user?.lastName}
                      </span>
                      <span className="email">{review.user?.email}</span>
                    </div>
                  </div>

                  <div className="review-entity">
                    {review.reviewType === "HOTEL" && review.hotel && (
                      <div className="entity-info">
                        <span className="label">Hotel:</span>
                        <span className="value">{review.hotel.name}</span>
                      </div>
                    )}
                    {review.reviewType === "APARTMENT" && review.apartment && (
                      <div className="entity-info">
                        <span className="label">Apartment:</span>
                        <span className="value">
                          {review.apartment.name} (#
                          {review.apartment.apartmentNumber})
                        </span>
                      </div>
                    )}
                    {review.reviewType === "ROOM" && review.room && (
                      <div className="entity-info">
                        <span className="label">Room:</span>
                        <span className="value">
                          {review.room.roomNumber} ({review.room.roomType})
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="comment">{review.comment}</p>

                  <div className="review-footer">
                    <span className="date">
                      Posted on{" "}
                      {new Date(review.createdAt || "").toLocaleDateString()}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(review.id, review.hotelId)}
                    >
                      Delete Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <InfiniteScrollFooter
            isFetching={isFetching}
            hasMore={hasMore}
            observerRef={scrollTargetRef as any}
            endMessage="No more reviews to load."
          />
        </>
      )}
    </div>
  );
};

export default Reviews;
