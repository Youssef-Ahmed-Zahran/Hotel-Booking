import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.scss";

// Globle route components
import AuthRoute from "./components/protected-route/auth-route/AuthRoute";
import PrivateRoute from "./components/protected-route/PrivateRoute/PrivateRoute";
import AdminRoute from "./components/protected-route/admin-route/AdminRoute";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import NotFound from "./components/not-found/NotFound";
import ErrorBoundary from "./components/error-boundary/ErrorBoundary";

// Pages
import Login from "./features/auth/pages/login/Login";
import Register from "./features/auth/pages/register/Register";
import Home from "./features/home/pages/Home";
import Hotels from "./features/hotels/pages/hotels/Hotels";
import HotelDetails from "./features/hotel-details/pages/hotel-details/HotelDetails";
import ApartmentDetails from "./features/apartment-details/pages/apartment-details/ApartmentDetails";
import RoomDetails from "./features/room-details/pages/room-details/RoomDetails";
import MyBookings from "./features/my-bookings/pages/my-bookings/MyBookings";
import CheckoutBooking from "./features/checkout-booking/pages/checkout-booking/CheckoutBooking";
import BookingConfirmationPage from "./features/checkout-booking/pages/booking-confirmation/BookingConfirmationPage";
import Profile from "./features/profile/pages/profile/Profile";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="app-content">
          <ErrorBoundary>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/hotels/:id" element={<HotelDetails />} />
              <Route path="/apartments/:id" element={<ApartmentDetails />} />
              <Route path="/rooms/:id" element={<RoomDetails />} />

              {/* Auth routes */}
              <Route element={<AuthRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Protected routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/checkout" element={<CheckoutBooking />} />
                <Route
                  path="/booking-confirmation"
                  element={<BookingConfirmationPage />}
                />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Admin routes */}
              <Route element={<AdminRoute />}></Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
