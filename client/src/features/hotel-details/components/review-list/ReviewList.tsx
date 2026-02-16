import React, { useState } from "react";
import type { Review } from "../../../../types";
import {
  useGetAllReviewsQuery,
  useDeleteReviewMutation,
} from "../../../admin/reviews/slice/reviewSlice";
import { useGetCurrentUserQuery } from "../../../auth/slice/authSlice";
import ReviewCard from "../review-card/ReviewCard";
import Loader from "../../../../components/loader/Loader";
import { useInfiniteScroll } from "../../../../hooks/useInfiniteScroll";
import InfiniteScrollFooter from "../../../../components/infinite-scroll-footer/InfiniteScrollFooter";
import "./reviewList.scss";

interface ReviewListProps {
  hotelId: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ hotelId }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error } = useGetAllReviewsQuery({
    hotelId,
    page,
    limit: 5,
  });
  const { data: currentUser } = useGetCurrentUserQuery();
  const [deleteReview] = useDeleteReviewMutation();

  const loadMore = () => {
    if (data?.pagination && page < data.pagination.totalPages && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const observerTarget = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: data ? page < data.pagination.totalPages : false,
    isLoading: isFetching,
  });

  if (isLoading) {
    return <Loader text="Loading reviews..." />;
  }

  if (error) {
    return <div className="review-list__error">Failed to load reviews.</div>;
  }

  const reviews = data?.reviews || [];
  const averageRating = data?.reviews.length ? (data.reviews.reduce((acc, r) => acc + r.rating, 0) / data.reviews.length).toFixed(1) : "0.0";
  const totalReviews = data?.pagination.total || 0;

  const handleDelete = async (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReview({ reviewId, hotelId }).unwrap();
      } catch (err) {
        console.error("Failed to delete review:", err);
        alert("Failed to delete review");
      }
    }
  };

  return (
    <div className="review-list">
      <div className="review-list__header">
        <div className="review-list__summary">
          <h2 className="review-list__title">Guest Reviews</h2>
          <div className="review-list__stats">
            <div className="review-list__rating-badge">
              {Number(averageRating).toFixed(1)}
            </div>
            <div className="review-list__count-info">
              <span className="review-list__rating-text">
                {totalReviews > 0
                  ? Number(averageRating) >= 4
                    ? "Excellent"
                    : "Good"
                  : "No ratings yet"}
              </span>
              <span className="review-list__count">
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="review-list__content">
        {reviews.length > 0 ? (
          <>
            {reviews.map((review: Review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onDelete={handleDelete}
                currentUserId={currentUser?.id}
                isAdmin={currentUser?.role === "ADMIN"}
              />
            ))}
            <InfiniteScrollFooter
              isFetching={isFetching}
              hasMore={data ? page < data.pagination.totalPages : false}
              observerRef={observerTarget}
            />
          </>
        ) : (
          <div className="review-list__empty">
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewList;
