import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateBookingStatusMutation } from "../../../../my-bookings/slice/BookingSlice";
import "./updateBooking.scss";
import { toast } from "react-hot-toast";
import {
  ClipboardEdit,
  CheckCircle2,
  CreditCard,
  Activity,
  AlertCircle,
  X
} from "lucide-react";

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
  const [updateBookingStatus, { isLoading, error: apiError }] = useUpdateBookingStatusMutation();

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
    <div className="update-booking-overlay">
      <div className="update-booking-modal">
        <header>
          <div className="header-title">
            <ClipboardEdit size={24} className="text-primary" />
            <h2>Update Booking Status</h2>
          </div>
          <p>
            Modify the current status and payment information for booking #{bookingId.slice(-8)}.
          </p>
          <button className="close-icon-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </header>

        {apiError && (
          <div className="form-error">
            <AlertCircle size={20} />
            <span>Failed to update booking. Please check your connection.</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-section">
            <div className="section-title">Status Information</div>

            <div className="grid-row">
              <div className="form-group">
                <label htmlFor="status">Booking Status</label>
                <div className="input-wrapper">
                  <Activity size={18} className="input-icon" />
                  <select
                    {...register("status")}
                    id="status"
                    className={`status-select ${errors.status ? "has-error" : ""}`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                {errors.status && (
                  <span className="error-message">{errors.status.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="paymentStatus">Payment Status</label>
                <div className="input-wrapper">
                  <CreditCard size={18} className="input-icon" />
                  <select
                    {...register("paymentStatus")}
                    id="paymentStatus"
                    className={`status-select ${errors.paymentStatus ? "has-error" : ""}`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
                {errors.paymentStatus && (
                  <span className="error-message">
                    {errors.paymentStatus.message}
                  </span>
                )}
              </div>
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
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  Save Changes
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateBookingModal;
