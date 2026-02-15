import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  reviewSchema,
  type ReviewFormData,
} from "../../../../../features/admin/validation/review";

interface CreateReviewsProps {
  onClose: () => void;
}

const CreateReviews: React.FC<CreateReviewsProps> = ({ onClose }) => {
  const isLoading = false;
  const error = null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      userId: "",
      hotelId: "",
      rating: 5,
      comment: "",
      reviewType: "HOTEL",
    },
  });

  const onSubmit = async (_data: ReviewFormData) => {
    try {
      // await createReview(data).unwrap();
      alert(
        "Create Review functionality is not yet implemented on the backend."
      );
      onClose();
    } catch (err) {
      console.error("Failed to create review:", err);
    }
  };

  return (
    <div className="create-review-form">
      <h2>Create New Review</h2>
      {error && <div className="error-message">Failed to create review</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid-row">
          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <input
              {...register("userId")}
              type="text"
              id="userId"
              className={errors.userId ? "has-error" : ""}
            />
            {errors.userId && (
              <span className="error-message">{errors.userId.message}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="hotelId">Hotel ID</label>
            <input
              {...register("hotelId")}
              type="text"
              id="hotelId"
              className={errors.hotelId ? "has-error" : ""}
            />
            {errors.hotelId && (
              <span className="error-message">{errors.hotelId.message}</span>
            )}
          </div>
        </div>

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

        <div className="form-group">
          <label htmlFor="reviewType">Review Type</label>
          <select {...register("reviewType")} id="reviewType">
            <option value="HOTEL">Hotel</option>
            <option value="APARTMENT">Apartment</option>
            <option value="ROOM">Room</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? "Creating..." : "Create Review"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReviews;
