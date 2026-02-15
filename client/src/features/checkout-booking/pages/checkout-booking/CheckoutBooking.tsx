import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import BookingSummaryCard from "../../components/booking-summary-card/BookingSummaryCard";
import BookingDetails from "../../components/details/BookingDetails";
import type { BookingDetails as BookingDetailsType } from "../../components/details/BookingDetails";
import Payment from "../../components/payment/Payment";
import type { PaymentInfo } from "../../../../validation/payment";
import {
  useCreateApartmentBookingMutation,
  useCreateRoomBookingMutation,
} from "../../../my-bookings/slice/BookingSlice";
import { useGetCurrentUserQuery } from "../../../auth/slice/authSlice";
import Loader from "../../../../components/loader/Loader";
import "./checkoutBooking.scss";

interface BookingData {
  hotelId: string;
  apartmentId?: string;
  roomId?: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  bookingType: "APARTMENT" | "ROOM";
  pricePerNight: number;
  totalAmount: number;
}

export default function CheckoutBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user } = useGetCurrentUserQuery();
  const bookingData = location.state?.bookingData as BookingData | undefined;

  const [bookingDetails, setBookingDetails] =
    useState<BookingDetailsType | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createApartmentBooking] = useCreateApartmentBookingMutation();
  const [createRoomBooking] = useCreateRoomBookingMutation();

  const handleDetailsChange = useCallback((details: BookingDetailsType) => {
    setBookingDetails(details);
  }, []);

  const handlePaymentChange = useCallback((payment: PaymentInfo) => {
    setPaymentInfo(payment);
  }, []);

  if (!bookingData) {
    return (
      <div className="checkout-booking">
        <div className="checkout-booking__container">
          <div className="checkout-booking__error-page">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h1>No Booking Data Found</h1>
            <p>
              Please start your booking from the accommodation details page.
            </p>
            <button
              className="checkout-booking__btn"
              onClick={() => navigate("/")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Loader fullscreen text="Loading..." />;
  }

  const nights = Math.ceil(
    (new Date(bookingData.checkOutDate).getTime() -
      new Date(bookingData.checkInDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const createBooking = async (
    _details: BookingDetailsType,
    paymentMethod: string,
    transactionId?: string
  ) => {
    const bookingPayload = {
      userId: user.id,
      hotelId: bookingData.hotelId,
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      numberOfGuests: bookingData.numberOfGuests,
      paymentAmount: bookingData.totalAmount,
      paymentCurrency: "USD",
      paymentMethod,
      paymentTransactionId: transactionId,
      paymentStatus: transactionId ? "COMPLETED" : "PENDING",
    };

    if (bookingData.bookingType === "APARTMENT" && bookingData.apartmentId) {
      return await createApartmentBooking({
        ...bookingPayload,
        apartmentId: bookingData.apartmentId,
      }).unwrap();
    } else if (bookingData.bookingType === "ROOM" && bookingData.roomId) {
      return await createRoomBooking({
        ...bookingPayload,
        roomId: bookingData.roomId,
      }).unwrap();
    }
    throw new Error("Invalid booking type");
  };

  const handlePayPalApprove = async (_data: any, details: any) => {
    setError("");

    if (!bookingDetails) {
      toast.error("Please fill in all required booking details");
      return;
    }

    // Validate required fields
    if (
      !bookingDetails.firstName ||
      !bookingDetails.lastName ||
      !bookingDetails.email ||
      !bookingDetails.phone
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    // details is the result of actions.order.capture()
    const transactionId = details?.id || "PAYPAL_TX_ID";

    try {
      // Create Booking with COMPLETED status
      const booking = await createBooking(
        bookingDetails,
        "paypal",
        transactionId
      );

      // Navigate
      navigate("/booking-confirmation", {
        state: {
          bookingId: booking.id,
          accommodationName:
            bookingData?.bookingType === "APARTMENT"
              ? "Luxury Apartment"
              : "Deluxe Room",
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
          numberOfGuests: bookingData.numberOfGuests,
          totalAmount: bookingData.totalAmount,
          guestName: `${bookingDetails.firstName} ${bookingDetails.lastName}`,
          guestEmail: bookingDetails.email,
        },
      });
      toast.success("Payment successful! Booking confirmed.");
    } catch (err: any) {
      console.error("Booking error after payment:", err);
      const errorMessage =
        err?.data?.message ||
        err.message ||
        "Failed to create booking after payment";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!bookingDetails) {
      setError("Please fill in all required booking details");
      return;
    }

    if (!paymentInfo) {
      setError("Please provide payment information");
      return;
    }

    // Validate required fields
    if (
      !bookingDetails.firstName ||
      !bookingDetails.lastName ||
      !bookingDetails.email ||
      !bookingDetails.phone
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingPayload = {
        userId: user.id,
        hotelId: bookingData.hotelId,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        numberOfGuests: bookingData.numberOfGuests,
        paymentAmount: bookingData.totalAmount,
        paymentCurrency: "USD",
        paymentMethod: paymentInfo.paymentMethod,
      };

      let result;
      if (bookingData.bookingType === "APARTMENT" && bookingData.apartmentId) {
        result = await createApartmentBooking({
          ...bookingPayload,
          apartmentId: bookingData.apartmentId,
        }).unwrap();
      } else if (bookingData.bookingType === "ROOM" && bookingData.roomId) {
        result = await createRoomBooking({
          ...bookingPayload,
          roomId: bookingData.roomId,
        }).unwrap();
      }

      if (result) {
        // Navigate to confirmation page
        navigate("/booking-confirmation", {
          state: {
            bookingId: result.id,
            accommodationName: "Your Accommodation",
            checkInDate: bookingData.checkInDate,
            checkOutDate: bookingData.checkOutDate,
            numberOfGuests: bookingData.numberOfGuests,
            totalAmount: bookingData.totalAmount,
            guestName: `${bookingDetails.firstName} ${bookingDetails.lastName}`,
            guestEmail: bookingDetails.email,
          },
        });
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Failed to create booking. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine step completion
  const isDetailsComplete =
    bookingDetails &&
    bookingDetails.firstName &&
    bookingDetails.lastName &&
    bookingDetails.email &&
    bookingDetails.phone;
  const isPaymentComplete = paymentInfo !== null;

  return (
    <div className="checkout-booking">
      <div className="checkout-booking__container">
        <h1 className="checkout-booking__title">Complete Your Booking</h1>

        {/* Progress Steps */}
        <div className="checkout-booking__progress">
          <div
            className={`checkout-booking__step ${
              isDetailsComplete
                ? "checkout-booking__step--complete"
                : "checkout-booking__step--active"
            }`}
          >
            <div className="checkout-booking__step-icon">
              {isDetailsComplete ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span>1</span>
              )}
            </div>
            <div className="checkout-booking__step-content">
              <span className="checkout-booking__step-title">
                Guest Details
              </span>
              <span className="checkout-booking__step-desc">
                Your information
              </span>
            </div>
          </div>

          <div className="checkout-booking__step-divider"></div>

          <div
            className={`checkout-booking__step ${
              isDetailsComplete && isPaymentComplete
                ? "checkout-booking__step--complete"
                : isDetailsComplete
                ? "checkout-booking__step--active"
                : ""
            }`}
          >
            <div className="checkout-booking__step-icon">
              {isDetailsComplete && isPaymentComplete ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span>2</span>
              )}
            </div>
            <div className="checkout-booking__step-content">
              <span className="checkout-booking__step-title">Payment</span>
              <span className="checkout-booking__step-desc">
                Secure checkout
              </span>
            </div>
          </div>

          <div className="checkout-booking__step-divider"></div>

          <div className="checkout-booking__step">
            <div className="checkout-booking__step-icon">
              <span>3</span>
            </div>
            <div className="checkout-booking__step-content">
              <span className="checkout-booking__step-title">Confirmation</span>
              <span className="checkout-booking__step-desc">
                Booking complete
              </span>
            </div>
          </div>
        </div>

        <div className="checkout-booking__content">
          <div className="checkout-booking__main">
            <BookingDetails
              onDetailsChange={handleDetailsChange}
              initialDetails={{
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phoneNumber || "",
              }}
            />

            <Payment
              onPaymentChange={handlePaymentChange}
              amount={bookingData.totalAmount}
              onPayPalApprove={handlePayPalApprove}
            />

            {/* Security Badges */}
            <div className="checkout-booking__security">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Secure SSL Encrypted Payment</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Your data is protected</span>
            </div>

            {error && <div className="checkout-booking__error">{error}</div>}

            {/* Only show main submit button for non-PayPal methods */}
            {paymentInfo?.paymentMethod !== "paypal" && (
              <button
                className="checkout-booking__submit"
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !isDetailsComplete ||
                  !paymentInfo ||
                  ((paymentInfo.paymentMethod === "credit_card" ||
                    paymentInfo.paymentMethod === "debit_card") &&
                    (!paymentInfo.cardNumber ||
                      paymentInfo.cardNumber.replace(/\s/g, "").length !== 16 ||
                      !paymentInfo.cardName ||
                      !paymentInfo.expiryDate ||
                      paymentInfo.expiryDate.length !== 5 ||
                      !paymentInfo.cvv ||
                      paymentInfo.cvv.length < 3))
                }
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="checkout-booking__spinner"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Pay ${bookingData.totalAmount.toFixed(2)}
                  </>
                )}
              </button>
            )}
          </div>

          <div className="checkout-booking__sidebar">
            <BookingSummaryCard
              accommodationName={
                bookingData.bookingType === "APARTMENT"
                  ? "Luxury Apartment"
                  : "Deluxe Room"
              }
              accommodationType={bookingData.bookingType}
              checkInDate={bookingData.checkInDate}
              checkOutDate={bookingData.checkOutDate}
              numberOfGuests={bookingData.numberOfGuests}
              pricePerNight={bookingData.pricePerNight}
              nights={nights}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
