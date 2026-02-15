import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Home,
  Hash,
  DollarSign,
  Users,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Type,
  Tag,
} from "lucide-react";
import "./updateRooms.scss";
import { useUpdateRoomMutation } from "../../slice/roomSlice";
import type { Room } from "../../../../../types";
import toast from "react-hot-toast";

import {
  roomUpdateSchema,
  type RoomUpdateFormData,
} from "../../../../../features/admin/validation/room";

interface UpdateRoomsProps {
  room: Room;
  onClose: () => void;
}

const UpdateRooms: React.FC<UpdateRoomsProps> = ({ room, onClose }) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [updateRoom, { isLoading, error: apiError }] = useUpdateRoomMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RoomUpdateFormData>({
    resolver: zodResolver(roomUpdateSchema),
    defaultValues: {
      roomNumber: room.roomNumber,
      roomType: room.roomType as "SINGLE" | "DOUBLE" | "SUITE" | "DELUXE",
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      isAvailable: room.isAvailable,
      bookableIndividually: room.bookableIndividually,
    },
  });

  const isAvailable = watch("isAvailable");
  const bookableIndividually = watch("bookableIndividually");

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

  const removeExistingImage = (imageUrl: string) => {
    setDeletedImages((prev) => [...prev, imageUrl]);
  };

  const onSubmit = async (data: RoomUpdateFormData) => {
    try {
      let imagesBase64: string[] | undefined = undefined;
      if (selectedImages.length > 0) {
        imagesBase64 = await Promise.all(
          selectedImages.map((file) => convertToBase64(file))
        );
      }

      const payload: any = {
        roomId: room.id,
        ...data,
      };
      if (imagesBase64) {
        payload.images = imagesBase64;
      }
      if (deletedImages.length > 0) {
        payload.deletedImages = deletedImages;
      }

      await updateRoom(payload).unwrap();
      toast.success("Room updated successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to update room:", err);
      toast.error("Failed to update room. Please try again.");
    }
  };

  return (
    <div className="update-room-form">
      <header>
        <h2>
          <Home size={24} className="text-primary" />
          Update Room
        </h2>
        <p>Edit room details and settings</p>
      </header>

      {apiError && (
        <div className="form-error">
          <AlertCircle size={20} />
          <span>Failed to update room. Please check your data.</span>
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
          <div className="section-title">Current Images</div>
          {room.images && room.images.length > 0 ? (
            <div className="existing-images-gallery">
              {room.images
                .filter((image) => !deletedImages.includes(image))
                .map((image, index) => (
                  <div key={index} className="existing-image">
                    <img src={image} alt={`Room ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(image)}
                      className="remove-image-btn"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <p className="no-images-text">No images uploaded yet</p>
          )}
        </div>

        <div className="form-section">
          <div className="section-title">Add New Images</div>
          <div className="image-upload-container">
            <label>Upload Additional Photos (Optional)</label>
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
        </div>

        <div className="form-section">
          <div className="section-title">Amenities</div>
          <div className="form-group">
            <label>
              <Tag size={18} className="inline-icon" />
              Current Amenities
            </label>
            <div className="amenities-tags">
              {room.amenities && room.amenities.length > 0 ? (
                room.amenities.map((amenity) => (
                  <span key={amenity.id} className="amenity-tag">
                    {amenity.name}
                  </span>
                ))
              ) : (
                <span className="no-amenities">No amenities added yet.</span>
              )}
            </div>
            <small>
              Use the Amenities Management page to add or remove amenities.
            </small>
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">Settings</div>
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
            className={`form-group checkbox ${
              bookableIndividually ? "active" : ""
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
                Updating...
              </span>
            ) : (
              "Update Room"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateRooms;
