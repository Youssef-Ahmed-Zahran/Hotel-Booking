import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Check,
  CreditCard,
  User,
  ShieldCheck,
  Lock,
  AlertCircle,
  Home,
  Loader2
} from "lucide-react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
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

  const handlePaymentChange = useCallback((payment: { method: "card" | "paypal"; cardDetails?: any }) => {
    const paymentInfo: PaymentInfo = {
      paymentMethod: payment.method === "card" ? "credit_card" : "paypal",
      ...(payment.method === "card" && payment.cardDetails
        ? {
          cardNumber: payment.cardDetails.cardNumber,
          cardName: payment.cardDetails.cardHolder,
          expiryDate: payment.cardDetails.expiryDate,
          cvv: payment.cardDetails.cvv,
        }
        : {}),
    };
    setPaymentInfo(paymentInfo);
  }, []);

  if (!bookingData) {
    return (
      <div className="checkout-booking">
        <div className="checkout-booking__container">
          <div className="checkout-booking__error-page">
            <AlertCircle className="checkout-booking__error-icon" />
            <h1>No Booking Data Found</h1>
            <p>
              Please start your booking from the accommodation details page.
            </p>
            <button
              className="checkout-booking__btn"
              onClick={() => navigate("/")}
            >
              <Home className="btn-icon" />
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
    <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID }}>
      <div className="checkout-booking">
        <div className="checkout-booking__container">
          <div className="checkout-booking__header">
            <h1 className="checkout-booking__title">Complete Your Booking</h1>
            <p className="checkout-booking__subtitle">
              Secure your stay in just a few steps
            </p>
          </div>

          {/* Progress Steps */}
          <div className="checkout-booking__progress">
            <div
              className={`checkout-booking__step ${isDetailsComplete
                ? "checkout-booking__step--complete"
                : "checkout-booking__step--active"
                }`}
            >
              <div className="checkout-booking__step-icon">
                {isDetailsComplete ? (
                  <Check size={20} />
                ) : (
                  <User size={20} />
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
              className={`checkout-booking__step ${isDetailsComplete && isPaymentComplete
                ? "checkout-booking__step--complete"
                : isDetailsComplete
                  ? "checkout-booking__step--active"
                  : ""
                }`}
            >
              <div className="checkout-booking__step-icon">
                {isDetailsComplete && isPaymentComplete ? (
                  <Check size={20} />
                ) : (
                  <CreditCard size={20} />
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
                <Check size={20} className="opacity-50" />
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
                onPaymentMethodChange={handlePaymentChange}
                amount={bookingData.totalAmount}
                onPayPalApprove={handlePayPalApprove}
              />

              {/* Security Badges */}
              <div className="checkout-booking__security">
                <div className="checkout-booking__security-item">
                  <ShieldCheck size={18} />
                  <span>Secure SSL Encrypted</span>
                </div>
                <div className="checkout-booking__security-divider"></div>
                <div className="checkout-booking__security-item">
                  <Lock size={18} />
                  <span>Your data is protected</span>
                </div>
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
                      <Loader2 className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
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
    </PayPalScriptProvider>
  );
}
