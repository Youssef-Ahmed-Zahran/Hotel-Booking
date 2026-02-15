import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Home,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Hash,
  DollarSign,
  Users,
  Bed,
  Bath,
  Building2,
  Type,
} from "lucide-react";
import "./createApartments.scss";
import { useCreateApartmentMutation } from "../../slice/apartmentSlice";
import { useGetHotelsQuery } from "../../../../../features/hotels/slice/HotelSlice";
import toast from "react-hot-toast";

import {
  apartmentSchema,
  type ApartmentFormData,
} from "../../../../../features/admin/validation/apartment";

interface CreateApartmentsProps {
  onClose: () => void;
}

const CreateApartments: React.FC<CreateApartmentsProps> = ({ onClose }) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [createApartment, { isLoading, error: apiError }] =
    useCreateApartmentMutation();
  const { data: hotelsData } = useGetHotelsQuery({ limit: 100 });

  const hotels = hotelsData?.hotels || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ApartmentFormData>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: {
      apartmentType: "STUDIO",
      roomsBookableSeparately: false,
      pricePerNight: 0,
      totalCapacity: 1,
      numberOfBedrooms: 1,
      numberOfBathrooms: 1,
      name: "",
      description: "",
      apartmentNumber: "",
      hotelId: "",
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

  const onSubmit = async (data: ApartmentFormData) => {
    try {
      let imagesBase64: string[] | undefined = undefined;
      if (selectedImages.length > 0) {
        imagesBase64 = await Promise.all(
          selectedImages.map((file) => convertToBase64(file))
        );
      }

      await createApartment({
        ...data,
        images: imagesBase64,
      }).unwrap();

      toast.success("Apartment created successfully!");
      onClose();
    } catch (err: any) {
      console.error("Failed to create apartment:", err);
      const errorMessage =
        err.data?.message || "Failed to create apartment. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="create-apartment-form">
      <header>
        <h2>
          <Home size={24} className="text-primary" />
          Create New Apartment
        </h2>
        <p>Add a new apartment unit to an existing hotel property.</p>
      </header>

      {apiError && (
        <div className="form-error">
          <AlertCircle size={20} />
          <span>Failed to create apartment. Please check your data.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-section">
          <div className="section-title">General Information</div>
          <div className="grid-row">
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
              <label htmlFor="apartmentNumber">Unit/Apartment Number</label>
              <div className="input-wrapper">
                <Hash size={18} className="input-icon" />
                <input
                  {...register("apartmentNumber")}
                  type="text"
                  id="apartmentNumber"
                  placeholder="e.g. 402-A"
                  className={errors.apartmentNumber ? "has-error" : ""}
                />
              </div>
              {errors.apartmentNumber && (
                <span className="error-message">
                  {errors.apartmentNumber.message}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="hotelId">Belongs to Hotel</label>
            <div className="input-wrapper">
              <Building2 size={18} className="input-icon" />
              <select
                {...register("hotelId")}
                id="hotelId"
                className={errors.hotelId ? "has-error" : ""}
              >
                <option value="">-- Select a Hotel property --</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name} ({hotel.city})
                  </option>
                ))}
              </select>
            </div>
            {errors.hotelId && (
              <span className="error-message">{errors.hotelId.message}</span>
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
            <label>Apartment Photos (At least one recommended)</label>
            <label className="image-upload-box">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
              />
              <Upload size={32} className="upload-icon" />
              <div className="upload-text">
                <span>Click to upload photos</span>
                <small>Multiple PNG, JPG up to 5MB each</small>
              </div>
            </label>

            {imagePreviews.length > 0 && (
              <div className="images-gallery">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview">
                    <img src={preview} alt={`Preview ${index + 1} `} />
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
          <button
            type="submit"
            disabled={isLoading}
            className="submit-btn"
            id="create-apartment-submit"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="loader-sm"></span>
                Creating...
              </span>
            ) : (
              "Create Apartment"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateApartments;
