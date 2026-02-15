import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Hotel,
  Mail,
  MapPin,
  Type,
  Phone,
  Star,
  X,
  Upload,
  Globe,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import "./createHotels.scss";
import { useCreateHotelMutation } from "../../../../../features/hotels/slice/HotelSlice";
import toast from "react-hot-toast";

import {
  hotelSchema,
  type HotelFormData,
} from "../../../../../features/admin/validation/hotel";

interface CreateHotelsProps {
  onClose: () => void;
}

const CreateHotels: React.FC<CreateHotelsProps> = ({ onClose }) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [createHotel, { isLoading, error: apiError }] =
    useCreateHotelMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<HotelFormData>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      rating: 0,
      isFeatured: false,
    },
  });

  const isFeatured = watch("isFeatured");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const validFiles: File[] = [];

      newFiles.forEach((file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (> 5MB)`);
          return;
        }
        validFiles.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });

      setSelectedImages((prev) => [...prev, ...validFiles]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const onSubmit = async (data: HotelFormData) => {
    try {
      const imageBase64Array = await Promise.all(
        selectedImages.map((file) => convertToBase64(file))
      );

      await createHotel({
        ...data,
        images: imageBase64Array,
      }).unwrap();

      toast.success("Hotel created successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to create hotel:", err);
      toast.error("Failed to create hotel. Please try again.");
    }
  };

  return (
    <div className="create-hotel-form">
      <header>
        <h2>
          <Hotel size={24} className="text-primary" />
          Create New Hotel
        </h2>
        <p>
          Fill in the details below to add a new property to your collection.
        </p>
      </header>

      {apiError && (
        <div className="form-error">
          <AlertCircle size={20} />
          <span>Failed to create hotel. Please check your data.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-section">
          <div className="section-title">General Information</div>
          <div className="grid-row">
            <div className="form-group">
              <label htmlFor="name">Hotel Name</label>
              <div className="input-wrapper">
                <Type size={18} className="input-icon" />
                <input
                  {...register("name")}
                  type="text"
                  id="name"
                  placeholder="e.g. Grand Luxury Resort"
                  className={errors.name ? "has-error" : ""}
                />
              </div>
              {errors.name && (
                <span className="error-message">{errors.name.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Reservation Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  {...register("email")}
                  type="email"
                  id="email"
                  placeholder="contact@hotel.com"
                  className={errors.email ? "has-error" : ""}
                />
              </div>
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <div className="input-wrapper">
              <textarea
                {...register("description")}
                id="description"
                placeholder="Describe the property's unique features and amenities..."
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
          <div className="section-title">Location Details</div>
          <div className="form-group">
            <label htmlFor="address">Full Address</label>
            <div className="input-wrapper">
              <MapPin size={18} className="input-icon" />
              <input
                {...register("address")}
                type="text"
                id="address"
                placeholder="Street address, building number..."
                className={errors.address ? "has-error" : ""}
              />
            </div>
            {errors.address && (
              <span className="error-message">{errors.address.message}</span>
            )}
          </div>

          <div className="grid-row three-col">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <div className="input-wrapper">
                <MapPin size={18} className="input-icon" />
                <input
                  {...register("city")}
                  type="text"
                  id="city"
                  placeholder="City"
                  className={errors.city ? "has-error" : ""}
                />
              </div>
              {errors.city && (
                <span className="error-message">{errors.city.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <div className="input-wrapper">
                <Globe size={18} className="input-icon" />
                <input
                  {...register("country")}
                  type="text"
                  id="country"
                  placeholder="Country"
                  className={errors.country ? "has-error" : ""}
                />
              </div>
              {errors.country && (
                <span className="error-message">{errors.country.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="postalCode">Postal Code</label>
              <div className="input-wrapper">
                <FileText size={18} className="input-icon" />
                <input
                  {...register("postalCode")}
                  type="text"
                  id="postalCode"
                  placeholder="Zip/Postal code"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">Additional Details</div>
          <div className="grid-row">
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <div className="input-wrapper">
                <Phone size={18} className="input-icon" />
                <input
                  {...register("phoneNumber")}
                  type="tel"
                  id="phoneNumber"
                  placeholder="+1 (234) 567-890"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="rating">Rating (0-5)</label>
              <div className="input-wrapper">
                <Star size={18} className="input-icon" />
                <input
                  {...register("rating", { valueAsNumber: true })}
                  type="number"
                  id="rating"
                  min="0"
                  max="5"
                  step="0.1"
                  className={errors.rating ? "has-error" : ""}
                />
              </div>
              {errors.rating && (
                <span className="error-message">{errors.rating.message}</span>
              )}
            </div>
          </div>

          <div className="image-upload-container">
            <label>Property Images</label>
            <div className="image-previews-grid">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="image-preview-wrapper">
                  <img src={preview} alt={`Hotel preview ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-image-btn"
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <label className="image-upload-box small">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  multiple
                />
                <Upload size={24} className="upload-icon" />
                <div className="upload-text">
                  <span>Add More</span>
                </div>
              </label>
            </div>
          </div>

          <div className={`form-group checkbox ${isFeatured ? "active" : ""}`}>
            <input
              {...register("isFeatured")}
              type="checkbox"
              id="isFeatured"
            />
            <label htmlFor="isFeatured">
              {isFeatured ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  Featured Property
                </span>
              ) : (
                "Mark as Featured Property"
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
                Creating...
              </span>
            ) : (
              "Create Hotel"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateHotels;
