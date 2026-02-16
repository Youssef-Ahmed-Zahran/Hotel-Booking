import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Home,
  Hash,
  DollarSign,
  Users,
  Bed,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Type,
} from "lucide-react";
import "./createRooms.scss";
import { useCreateRoomMutation } from "../../slice/roomSlice";
import { useGetHotelsQuery } from "../../../../hotels/slice/HotelSlice";
import { useGetApartmentsQuery } from "../../../apartments/slice/apartmentSlice";
import toast from "react-hot-toast";

import {
  roomSchema,
  type RoomFormData,
} from "../../../../../features/admin/validation/room";

interface CreateRoomsProps {
  onClose: () => void;
}

const CreateRooms: React.FC<CreateRoomsProps> = ({ onClose }) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [createRoom, { isLoading, error: apiError }] = useCreateRoomMutation();

  const { data: hotelsData } = useGetHotelsQuery({ limit: 100 });
  const { data: apartmentsData } = useGetApartmentsQuery({ limit: 100 });

  const hotels = hotelsData?.hotels || [];
  const allApartments = apartmentsData?.apartments || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomType: "SINGLE",
      isAvailable: true,
      bookableIndividually: false,
      pricePerNight: 0,
      capacity: 1,
      roomNumber: "",
      hotelId: "",
      apartmentId: "",
    },
  });

  const selectedHotelId = watch("hotelId");
  const bookableIndividually = watch("bookableIndividually");
  const isAvailable = watch("isAvailable");

  // Filter apartments based on selected hotel
  const filteredApartments = selectedHotelId
    ? allApartments.filter((apt) => apt.hotelId === selectedHotelId)
    : [];

  // Reset apartment selection when hotel changes
  useEffect(() => {
    if (selectedHotelId) {
      setValue("apartmentId", "");
    }
  }, [selectedHotelId, setValue]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validFiles = files.filter((file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
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

  const onSubmit = async (data: RoomFormData) => {
    try {
      let imagesBase64: string[] | undefined = undefined;
      if (selectedImages.length > 0) {
        imagesBase64 = await Promise.all(
          selectedImages.map((file) => convertToBase64(file))
        );
      }

      const payload: any = {
        ...data,
        images: imagesBase64,
      };

      // Remove empty hotel/apartment IDs
      if (!payload.hotelId) delete payload.hotelId;
      if (!payload.apartmentId) delete payload.apartmentId;

      await createRoom(payload).unwrap();

      toast.success("Room created successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to create room:", err);
      toast.error("Failed to create room. Please try again.");
    }
  };

  return (
    <div className="create-room-form">
      <header>
        <h2>
          <Home size={24} className="text-primary" />
          Create New Room
        </h2>
        <p>Add a new room to your hotel or apartment property.</p>
      </header>

      {apiError && (
        <div className="form-error">
          <AlertCircle size={20} />
          <span>Failed to create room. Please check your data.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-section">
          <div className="section-title">Room Information</div>
          <div className="grid-row">
            <div className="form-group">
              <label htmlFor="roomNumber">Room Number</label>
              <div className="input-wrapper">
                <Hash size={18} className="input-icon" />
                <input
                  {...register("roomNumber")}
                  type="text"
                  id="roomNumber"
                  placeholder="e.g. 101, A-205"
                  className={errors.roomNumber ? "has-error" : ""}
                />
              </div>
              {errors.roomNumber && (
                <span className="error-message">
                  {errors.roomNumber.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="roomType">Room Type</label>
              <div className="input-wrapper">
                <Type size={18} className="input-icon" />
                <select
                  {...register("roomType")}
                  id="roomType"
                  className={errors.roomType ? "has-error" : ""}
                >
                  <option value="SINGLE">Single</option>
                  <option value="DOUBLE">Double</option>
                  <option value="SUITE">Suite</option>
                  <option value="DELUXE">Deluxe</option>
                </select>
              </div>
              {errors.roomType && (
                <span className="error-message">{errors.roomType.message}</span>
              )}
            </div>
          </div>

          <div className="grid-row">
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
              <label htmlFor="capacity">Guest Capacity</label>
              <div className="input-wrapper">
                <Users size={18} className="input-icon" />
                <input
                  {...register("capacity", { valueAsNumber: true })}
                  type="number"
                  id="capacity"
                  min="1"
                  placeholder="Guests"
                  className={errors.capacity ? "has-error" : ""}
                />
              </div>
              {errors.capacity && (
                <span className="error-message">{errors.capacity.message}</span>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">Property Assignment</div>
          <div className="form-group">
            <label htmlFor="hotelId">Belongs to Hotel</label>
            <div className="input-wrapper">
              <Building2 size={18} className="input-icon" />
              <select
                {...register("hotelId")}
                id="hotelId"
                className={errors.hotelId ? "has-error" : ""}
              >
                <option value="">-- Select a Hotel --</option>
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

          {selectedHotelId && filteredApartments.length > 0 && (
            <div className="form-group">
              <label htmlFor="apartmentId">
                Belongs to Apartment (Optional)
              </label>
              <div className="input-wrapper">
                <Bed size={18} className="input-icon" />
                <select {...register("apartmentId")} id="apartmentId">
                  <option value="">-- Select an Apartment --</option>
                  {filteredApartments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      {apt.name} - Unit {apt.apartmentNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <div className="section-title">Media & Settings</div>
          <div className="image-upload-container">
            <label>Room Photos (At least one recommended)</label>
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
                    <img src={preview} alt={`Preview ${index + 1}`} />
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

          <div className={`form-group checkbox ${isAvailable ? "active" : ""}`}>
            <input
              {...register("isAvailable")}
              type="checkbox"
              id="isAvailable"
            />
            <label htmlFor="isAvailable">
              {isAvailable ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  Room is available for booking
                </span>
              ) : (
                "Mark room as available?"
              )}
            </label>
          </div>

          <div
            className={`form-group checkbox ${bookableIndividually ? "active" : ""
              }`}
          >
            <input
              {...register("bookableIndividually")}
              type="checkbox"
              id="bookableIndividually"
            />
            <label htmlFor="bookableIndividually">
              {bookableIndividually ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-success" />
                  Can be booked separately
                </span>
              ) : (
                "Allow individual booking?"
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
              "Create Room"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRooms;
