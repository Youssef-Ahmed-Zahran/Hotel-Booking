import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star, Send, CheckCircle2 } from "lucide-react";
import { useCreateReviewMutation } from "../../../admin/reviews/slice/reviewSlice";
import { useGetCurrentUserQuery } from "../../../auth/slice/authSlice";
import "./addReview.scss";

import {
  reviewSchema,
  type ReviewFormData,
} from "../../../../validation/review";

interface AddReviewProps {
  hotelId: string;
}

const MAX_CHARACTERS = 500;

const AddReview: React.FC<AddReviewProps> = ({ hotelId }) => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const [createReview, { isLoading }] = useCreateReviewMutation();

  const [hover, setHover] = useState<number>(0);
  const [success, setSuccess] = useState<boolean>(false);

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
      rating: 0,
      comment: "",
    },
  });

  const rating = watch("rating");
  const comment = watch("comment");
  const charCount = comment?.length || 0;

  if (!currentUser) {
    return (
      <div className="add-review add-review--guest">
        <p>
          Please{" "}
          <a href="/login" className="link">
            login
          </a>{" "}
          to leave a review.
        </p>
      </div>
    );
  }

  const getInitials = () => {
    if (currentUser.firstName && currentUser.lastName) {
      return `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();
    }
    return currentUser.username?.slice(0, 2).toUpperCase() || "U";
  };

  const onSubmit = async (data: ReviewFormData) => {
    setSuccess(false);
    try {
      await createReview({
        userId: currentUser.id,
        hotelId,
        ...data,
        reviewType: "HOTEL",
      }).unwrap();

      setSuccess(true);
      reset();
      setHover(0);

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error("Failed to submit review:", err);
    }
  };

  return (
    <div className="add-review">
      <div className="add-review__header">
        <div className="add-review__user-profile">
          <div className="add-review__avatar">
            {currentUser.profileImageUrl ? (
              <img
                src={currentUser.profileImageUrl}
                alt={currentUser.username}
              />
            ) : (
              <span className="add-review__initials">{getInitials()}</span>
            )}
          </div>
          <div className="add-review__info">
            <h3 className="add-review__title">Share your experience</h3>
            <p className="add-review__subtitle">
              Hi {currentUser.firstName || currentUser.username}, tell others
              what you thought!
            </p>
          </div>
        </div>
      </div>

      <form className="add-review__form" onSubmit={handleSubmit(onSubmit)}>
        <div className="add-review__rating-group">
          <label className="add-review__label">Overall Rating</label>
          <div className="add-review__stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`add-review__star-btn ${
                  (hover || rating) >= star
                    ? "add-review__star-btn--active"
                    : ""
                }`}
                onClick={() =>
                  setValue("rating", star, { shouldValidate: true })
                }
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className="add-review__star-icon"
                  fill={(hover || rating) >= star ? "currentColor" : "none"}
                  size={32}
                />
              </button>
            ))}
          </div>
          {errors.rating && (
            <div className="add-review__error-text">
              {errors.rating.message}
            </div>
          )}
        </div>

        <div className="add-review__field">
          <div className="add-review__label-row">
            <label htmlFor="comment" className="add-review__label">
              Your Review
            </label>
            <span
              className={`add-review__char-count ${
                charCount > MAX_CHARACTERS
                  ? "add-review__char-count--error"
                  : ""
              }`}
            >
              {charCount}/{MAX_CHARACTERS}
            </span>
          </div>
          <textarea
            {...register("comment")}
            id="comment"
            className={`add-review__textarea ${
              errors.comment ? "add-review__textarea--error" : ""
            }`}
            placeholder="What did you like or dislike? How was the service?"
            rows={4}
            maxLength={MAX_CHARACTERS}
          />
          {errors.comment && (
            <div className="add-review__error-text">
              {errors.comment.message}
            </div>
          )}
        </div>

        {success && (
          <div className="add-review__success">
            <CheckCircle2 size={20} />
            <span>Your review has been submitted successfully!</span>
          </div>
        )}

        <button
          type="submit"
          className="add-review__submit"
          disabled={isLoading || charCount > MAX_CHARACTERS}
        >
          {isLoading ? (
            <>
              <span className="add-review__spinner"></span>
              Submitting...
            </>
          ) : (
            <>
              <Send size={18} />
              Post Review
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddReview;
