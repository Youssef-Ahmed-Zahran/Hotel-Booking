import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Review } from "../../../../types";
import { useUpdateReviewMutation } from "../../../admin/reviews/slice/reviewSlice";
import "./reviewCard.scss";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().min(1, "Comment is required"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewCardProps {
  review: Review;
  onDelete?: (reviewId: string) => void;
  currentUserId?: string;
  isAdmin?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onDelete,
  currentUserId,
  isAdmin,
}) => {
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [editHover, setEditHover] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: review.rating,
      comment: review.comment || "",
    },
  });

  const watchedRating = watch("rating");

  const { user, rating, comment, createdAt } = review;
  const date = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const isOwner = currentUserId && review.userId === currentUserId;
  const canDelete = isAdmin || isOwner;
  const canEdit = isOwner;

  const onUpdate = async (data: ReviewFormData) => {
    try {
      await updateReview({
        reviewId: review.id,
        rating: data.rating,
        comment: data.comment,
        hotelId: review.hotelId,
      }).unwrap();
      setIsEditing(false);
    } catch (err: any) {
      // Error is handled by the component or toast
    }
  };

  const renderStars = (currentRating: number, interactive = false) => {
    return Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1;
      const filled = interactive
        ? (editHover || watchedRating) >= starValue
        : currentRating >= starValue;

      if (interactive) {
        return (
          <button
            key={index}
            type="button"
            className={`star star--interactive ${
              filled ? "star--filled" : "star--empty"
            }`}
            onClick={() =>
              setValue("rating", starValue, { shouldValidate: true })
            }
            onMouseEnter={() => setEditHover(starValue)}
            onMouseLeave={() => setEditHover(0)}
          >
            ★
          </button>
        );
      }

      return (
        <span
          key={index}
          className={`star ${filled ? "star--filled" : "star--empty"}`}
        >
          ★
        </span>
      );
    });
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username?.slice(0, 2).toUpperCase() || "U";
  };

  return (
    <div className={`review-card ${isEditing ? "review-card--editing" : ""}`}>
      <div className="review-card__header">
        <div className="review-card__user">
          <div className="review-card__avatar">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt={user.username} />
            ) : (
              <span className="review-card__initials">{getInitials()}</span>
            )}
          </div>
          <div className="review-card__user-info">
            <h4 className="review-card__username">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username}
            </h4>
            <span className="review-card__date">{date}</span>
          </div>
        </div>
        <div className="review-card__meta">
          {!isEditing && (
            <div className="review-card__rating">{renderStars(rating)}</div>
          )}
          <div className="review-card__actions">
            {!isEditing && canEdit && (
              <button
                className="review-card__action review-card__action--edit"
                onClick={() => {
                  reset({
                    rating: review.rating,
                    comment: review.comment || "",
                  });
                  setIsEditing(true);
                }}
                title="Edit review"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                >
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              </button>
            )}
            {canDelete && onDelete && !isEditing && (
              <button
                className="review-card__action review-card__action--delete"
                onClick={() => onDelete(review.id)}
                title="Delete review"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                >
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        <form
          className="review-card__edit-form"
          onSubmit={handleSubmit(onUpdate)}
        >
          <div className="review-card__edit-rating">
            {renderStars(watchedRating, true)}
            {errors.rating && (
              <span className="review-card__error">
                {errors.rating.message}
              </span>
            )}
          </div>
          <textarea
            {...register("comment")}
            className={`review-card__edit-textarea ${
              errors.comment ? "has-error" : ""
            }`}
            placeholder="Update your review..."
            rows={3}
          />
          {errors.comment && (
            <p className="review-card__error">{errors.comment.message}</p>
          )}
          <div className="review-card__edit-actions">
            <button
              type="button"
              className="review-card__btn review-card__btn--cancel"
              onClick={() => {
                setIsEditing(false);
                reset();
              }}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="review-card__btn review-card__btn--save"
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        comment && (
          <div className="review-card__body">
            <p className="review-card__comment">{comment}</p>
          </div>
        )
      )}
    </div>
  );
};

export default ReviewCard;
