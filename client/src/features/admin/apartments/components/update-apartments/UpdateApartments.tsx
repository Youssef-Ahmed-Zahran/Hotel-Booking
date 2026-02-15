import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Home,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Users,
  Bed,
  Bath,
  Save,
  Type,
} from "lucide-react";
import "./updateApartments.scss";
import { useUpdateApartmentMutation } from "../../slice/apartmentSlice";
import type { Apartment } from "../../../../../types";
import toast from "react-hot-toast";

import {
  apartmentUpdateSchema,
  type ApartmentUpdateFormData,
} from "../../../../../features/admin/validation/apartment";

interface UpdateApartmentsProps {
  apartment: Apartment;
  onClose: () => void;
}

const UpdateApartments: React.FC<UpdateApartmentsProps> = ({
  apartment,
  onClose,
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    apartment.images || []
  );

  const [updateApartment, { isLoading, error: apiError }] =
    useUpdateApartmentMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ApartmentUpdateFormData>({
    resolver: zodResolver(apartmentUpdateSchema),
    defaultValues: {
      name: apartment.name || "",
      description: apartment.description || "",
      pricePerNight: apartment.pricePerNight,
      totalCapacity: apartment.totalCapacity,
      numberOfBedrooms: apartment.numberOfBedrooms,
      numberOfBathrooms: apartment.numberOfBathrooms,
      apartmentType: apartment.apartmentType as any,
      roomsBookableSeparately: apartment.roomsBookableSeparately,
    },
  });

  const roomsBookableSeparately = watch("roomsBookableSeparately");

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validFiles = files.filter((file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large(max 5MB)`);
          return false;
        }
        return true;
      });

      setSelectedImages((prev) => [...prev, ...validFiles]);

      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeNewImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const onSubmit = async (data: ApartmentUpdateFormData) => {
    try {
      let newImagesBase64: string[] = [];
      if (selectedImages.length > 0) {
        newImagesBase64 = await Promise.all(
          selectedImages.map((file) => convertToBase64(file))
        );
      }

      // Combine existing images (URLs) with new ones (Base64)
      // Note: Backend should handle both URLs and Base64 or we might need to adjust based on API requirements
      const allImages = [...existingImages, ...newImagesBase64];

      await updateApartment({
        apartmentId: apartment.id,
        ...data,
        images: allImages,
      }).unwrap();

      toast.success("Apartment updated successfully!");
      onClose();
    } catch (err: any) {
      console.error("Failed to update apartment:", err);
      const errorMessage =
        err.data?.message || "Failed to update apartment. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="update-apartment-form">
      <header>
        <h2>
          <Home size={24} className="text-primary" />
          Update Apartment Details
        </h2>
        <p>Modify the information for {apartment.name} below.</p>
      </header>

      {apiError && (
        <div className="form-error">
          <AlertCircle size={20} />
          <span>Failed to update apartment. Please check your data.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-section">
          <div className="section-title">General Information</div>
          <div className="form-group">
            <label htmlFor="name">Apartment Name</label>
            <div className="input-wrapper">
              <Type size={18} className="input-icon" />
              <input
                {...register("name")}
                type="text"
                id="name"
                placeholder="e.g. Deluxe Ocean View Suite"
                className={errors.name ? "has-error" : ""}
              />
            </div>
            {errors.name && (
              <span className="error-message">{errors.name.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <div className="input-wrapper">
              <textarea
                {...register("description")}
                id="description"
                placeholder="Highlight the apartment's layout, views, and specific features..."
                className={errors.description ? "has-error" : ""}
              />
            </div>
            {errors.description && (
              <span className="error-message">
                {errors.description.message}
              </span>
            )}
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">Pricing & Capacity</div>
          <div className="grid-row three-col">
            <div className="form-group">
              <label htmlFor="pricePerNight">Price per Night ($)</label>
              <div className="input-wrapper">
                <DollarSign size={18} className="input-icon" />
                <input
                  {...register("pricePerNight", { valueAsNumber: true })}
                  type="number"
                  id="pricePerNight"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={errors.pricePerNight ? "has-error" : ""}
                />
              </div>
              {errors.pricePerNight && (
                <span className="error-message">
                  {errors.pricePerNight.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="totalCapacity">Total Capacity</label>
              <div className="input-wrapper">
                <Users size={18} className="input-icon" />
                <input
                  {...register("totalCapacity", { valueAsNumber: true })}
                  type="number"
                  id="totalCapacity"
                  min="1"
                  placeholder="Guests"
                  className={errors.totalCapacity ? "has-error" : ""}
                />
              </div>
              {errors.totalCapacity && (
                <span className="error-message">
                  {errors.totalCapacity.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="apartmentType">Apartment Type</label>
              <div className="input-wrapper">
                <Type size={18} className="input-icon" />
                <select
                  {...register("apartmentType")}
                  id="apartmentType"
                  className={errors.apartmentType ? "has-error" : ""}
                >
                  <option value="STUDIO">Studio</option>
                  <option value="ONE_BEDROOM">1 Bedroom</option>
                  <option value="TWO_BEDROOM">2 Bedroom</option>
                  <option value="THREE_BEDROOM">3 Bedroom</option>
                  <option value="PENTHOUSE">Penthouse</option>
                  <option value="SUITE">Suite</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid-row">
            <div className="form-group">
              <label htmlFor="numberOfBedrooms">Number of Bedrooms</label>
              <div className="input-wrapper">
                <Bed size={18} className="input-icon" />
                <input
                  {...register("numberOfBedrooms", { valueAsNumber: true })}
                  type="number"
                  id="numberOfBedrooms"
                  min="1"
                  className={errors.numberOfBedrooms ? "has-error" : ""}
                />
              </div>
              {errors.numberOfBedrooms && (
                <span className="error-message">
                  {errors.numberOfBedrooms.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="numberOfBathrooms">Number of Bathrooms</label>
              <div className="input-wrapper">
                <Bath size={18} className="input-icon" />
                <input
                  {...register("numberOfBathrooms", { valueAsNumber: true })}
                  type="number"
                  id="numberOfBathrooms"
                  min="1"
                  className={errors.numberOfBathrooms ? "has-error" : ""}
                />
              </div>
              {errors.numberOfBathrooms && (
                <span className="error-message">
                  {errors.numberOfBathrooms.message}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">Media & Settings</div>
          <div className="image-upload-container">
            <label>Apartment Photos</label>
            <div className="images-gallery existing-images">
              {existingImages.map((url, index) => (
                <div key={`existing - ${index} `} className="image-preview">
                  <img src={url} alt={`Existing ${index + 1} `} />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="remove-image-btn"
                    title="Remove existing image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <label className="image-upload-box mt-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
              />
              <Upload size={32} className="upload-icon" />
              <div className="upload-text">
                <span>Add more photos</span>
                <small>Multiple PNG, JPG up to 5MB each</small>
              </div>
            </label>

            {imagePreviews.length > 0 && (
              <div className="images-gallery">
                {imagePreviews.map((preview, index) => (
                  <div key={`new- ${index} `} className="image-preview">
                    <img src={preview} alt={`New preview ${index + 1} `} />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="remove-image-btn"
                      title="Remove new image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className={`form - group checkbox ${
              roomsBookableSeparately ? "active" : ""
            } `}
          >
            <input
              {...register("roomsBookableSeparately")}
              type="checkbox"
              id="roomsBookableSeparately"
            />
            <label htmlFor="roomsBookableSeparately">
              {roomsBookableSeparately ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  Rooms can be booked separately
                </span>
              ) : (
                "Allow rooms to be booked separately?"
              )}
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="loader-sm"></span>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save size={18} />
                Save Changes
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateApartments;
