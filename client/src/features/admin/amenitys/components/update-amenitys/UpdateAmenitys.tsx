import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "./updateAmenitys.scss";
import { useUpdateAmenityMutation } from "../../slice/amenitySlice";
import type { Amenity } from "../../../../../types";
import { FiX, FiType, FiFileText, FiSave, FiAlertCircle } from "react-icons/fi";

import {
  amenitySchema,
  type AmenityFormData,
} from "../../../../../features/admin/validation/amenity";

interface UpdateAmenitysProps {
  amenity: Amenity;
  onClose: () => void;
}

const UpdateAmenitys: React.FC<UpdateAmenitysProps> = ({
  amenity,
  onClose,
}) => {
  const [updateAmenity, { isLoading, error }] = useUpdateAmenityMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AmenityFormData>({
    resolver: zodResolver(amenitySchema),
    defaultValues: {
      name: amenity.name || "",
      description: amenity.description || "",
    },
  });

  const onSubmit = async (data: AmenityFormData) => {
    try {
      await updateAmenity({
        amenityId: amenity.id,
        ...data,
      }).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to update amenity:", err);
    }
  };

  return (
    <div className="update-amenity-form">
      {error && (
        <div className="error-message fade-in">
          <FiAlertCircle />
          <span>Failed to update amenity. Please try again.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="name">
            <FiType className="input-icon" /> Name
          </label>
          <input
            {...register("name")}
            type="text"
            id="name"
            className={`form-input ${errors.name ? "has-error" : ""}`}
            placeholder="e.g. High-speed WiFi"
          />
          {errors.name && (
            <span className="error-message">{errors.name.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">
            <FiFileText className="input-icon" /> Description
          </label>
          <textarea
            {...register("description")}
            id="description"
            rows={4}
            className={`form-textarea ${errors.description ? "has-error" : ""}`}
            placeholder="Add a brief description of this amenity..."
          />
          {errors.description && (
            <span className="error-message">{errors.description.message}</span>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn-cancel">
            <FiX /> Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-submit">
            {isLoading ? (
              <>Saving...</>
            ) : (
              <>
                <FiSave /> Update Amenity
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateAmenitys;
