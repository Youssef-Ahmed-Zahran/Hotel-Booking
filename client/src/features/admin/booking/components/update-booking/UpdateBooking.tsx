import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateBookingStatusMutation } from "../../../../my-bookings/slice/BookingSlice";
import "./updateBooking.scss";
import { toast } from "react-hot-toast";

import {
  bookingSchema,
  type BookingFormData,
} from "../../../../../features/admin/validation/booking";

interface UpdateBookingModalProps {
  bookingId: string;
  currentStatus: string;
  currentPaymentStatus: string;
  onClose: () => void;
}

const UpdateBookingModal = ({
  bookingId,
  currentStatus,
  currentPaymentStatus,
  onClose,
}: UpdateBookingModalProps) => {
  const [updateBookingStatus, { isLoading }] = useUpdateBookingStatusMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      status: currentStatus as any,
      paymentStatus: currentPaymentStatus as any,
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    try {
      await updateBookingStatus({
        bookingId,
        ...data,
      }).unwrap();
      toast.success("Booking status updated successfully");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update booking status");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Update Booking Status</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="status">Booking Status</label>
            <select
              {...register("status")}
              id="status"
              className={`status - select ${errors.status ? "has-error" : ""} `}
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
            </select>
            {errors.status && (
              <span className="error-message">{errors.status.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="paymentStatus">Payment Status</label>
            <select
              {...register("paymentStatus")}
              id="paymentStatus"
              className={`status - select ${
                errors.paymentStatus ? "has-error" : ""
              } `}
            >
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            {errors.paymentStatus && (
              <span className="error-message">
                {errors.paymentStatus.message}
              </span>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="save-btn">
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateBookingModal;
