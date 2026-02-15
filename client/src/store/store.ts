import { configureStore } from "@reduxjs/toolkit";
// Auth
import { authSlice } from "../features/auth/slice/authSlice.ts";
// User
import { userSlice } from "../features/admin/users/slice/userSlice.ts";
// Hotel
import { hotelSlice } from "../features/hotels/slice/HotelSlice.ts";
// Amenity
import { amenitySlice } from "../features/admin/amenitys/slice/amenitySlice.ts";
// Apartment
import { apartmentSlice } from "../features/admin/apartments/slice/apartmentSlice.ts";
// Room
import { roomSlice } from "../features/admin/rooms/slice/roomSlice.ts";
// Booking
import { bookingSlice as userBookingSlice } from "../features/my-bookings/slice/BookingSlice.ts";
// Review
import { reviewSlice } from "../features/admin/reviews/slice/reviewSlice.ts";
// Dashboard
import { dashboardSlice } from "../features/admin/dashboard/slice/dashboardSlice.ts";

export const store = configureStore({
  reducer: {
    [authSlice.reducerPath]: authSlice.reducer,
    [userSlice.reducerPath]: userSlice.reducer,
    [hotelSlice.reducerPath]: hotelSlice.reducer,
    [amenitySlice.reducerPath]: amenitySlice.reducer,
    [apartmentSlice.reducerPath]: apartmentSlice.reducer,
    [roomSlice.reducerPath]: roomSlice.reducer,
    [userBookingSlice.reducerPath]: userBookingSlice.reducer,
    [reviewSlice.reducerPath]: reviewSlice.reducer,
    [dashboardSlice.reducerPath]: dashboardSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authSlice.middleware)
      .concat(userSlice.middleware)
      .concat(hotelSlice.middleware)
      .concat(amenitySlice.middleware)
      .concat(apartmentSlice.middleware)
      .concat(roomSlice.middleware)
      .concat(userBookingSlice.middleware)
      .concat(reviewSlice.middleware)
      .concat(dashboardSlice.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
