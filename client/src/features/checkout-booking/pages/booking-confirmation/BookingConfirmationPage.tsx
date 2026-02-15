import { useLocation, useNavigate } from "react-router-dom";
import BookingConfirmation from "../../components/confirmation/BookingConfirmation";
import "./bookingConfirmationPage.scss";

interface ConfirmationData {
  bookingId: string;
  accommodationName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalAmount: number;
  guestName: string;
  guestEmail: string;
}

export default function BookingConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const confirmationData = location.state as ConfirmationData | undefined;

  if (!confirmationData) {
    return (
      <div className="booking-confirmation-page">
        <div className="booking-confirmation-page__container">
          <div className="booking-confirmation-page__error">
            <h1>Confirmation Not Found</h1>
            <p>Please check your email for booking confirmation details.</p>
            <button
              className="booking-confirmation-page__btn"
              onClick={() => navigate("/")}
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-confirmation-page">
      <div className="booking-confirmation-page__container">
        <BookingConfirmation {...confirmationData} />
      </div>
    </div>
  );
}
