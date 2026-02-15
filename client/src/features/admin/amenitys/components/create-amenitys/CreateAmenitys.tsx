import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "./createAmenitys.scss";
import { useCreateAmenityMutation } from "../../slice/amenitySlice";
import {
  FiX,
  FiType,
  FiFileText,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";

import {
  amenitySchema,
  type AmenityFormData,
} from "../../../../../features/admin/validation/amenity";

interface CreateAmenitysProps {
  roomId: string;
  onClose: () => void;
}

const CreateAmenitys: React.FC<CreateAmenitysProps> = ({ roomId, onClose }) => {
  const [createAmenity, { isLoading, error }] = useCreateAmenityMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AmenityFormData>({
    resolver: zodResolver(amenitySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: AmenityFormData) => {
    try {
      await createAmenity({
        ...data,
        roomId,
      }).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to create amenity:", err);
    }
  };

  return (
    <div className="create-amenity-form">
      {error && (
        <div className="error-message fade-in">
          <FiAlertCircle />
          <span>Failed to create amenity. Please try again.</span>
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
            placeholder="e.g. High-speed WiFi"
            className={`form-input ${errors.name ? "has-error" : ""}`}
            autoFocus
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
            placeholder="Add a brief description of this amenity..."
            rows={4}
            className={`form-textarea ${errors.description ? "has-error" : ""}`}
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
              <>Creating...</>
            ) : (
              <>
                <FiCheck /> Create Amenity
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAmenitys;
