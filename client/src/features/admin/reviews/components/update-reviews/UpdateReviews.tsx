import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import "./updateReviews.scss";
import { useUpdateReviewMutation } from "../../slice/reviewSlice";
import type { Review } from "../../../../../types";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface UpdateReviewsProps {
  review: Review;
  onClose: () => void;
}

const UpdateReviews: React.FC<UpdateReviewsProps> = ({ review, onClose }) => {
  const [updateReview, { isLoading, error }] = useUpdateReviewMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: review.rating,
      comment: review.comment || "",
    },
  });

  const onSubmit = async (data: ReviewFormData) => {
    try {
      await updateReview({
        reviewId: review.id,
        ...data,
      }).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to update review:", err);
    }
  };

  return (
    <div className="update-review-form">
      <h2>Update Review</h2>
      {error && <div className="error-message">Failed to update review</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="rating">Rating (1-5)</label>
          <input
            {...register("rating", { valueAsNumber: true })}
            type="number"
            id="rating"
            min="1"
            max="5"
            className={errors.rating ? "has-error" : ""}
          />
          {errors.rating && (
            <span className="error-message">{errors.rating.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="comment">Comment</label>
          <textarea {...register("comment")} id="comment" rows={4} />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? "Updating..." : "Update Review"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateReviews;
