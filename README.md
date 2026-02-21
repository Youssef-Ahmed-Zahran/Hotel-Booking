

https://github.com/user-attachments/assets/c672fe03-cdcb-4821-85f9-721c61418ac5

# 🚀 Full-Stack Hotel Booking Platform

A complete Hotel Booking & Management System—a fully functional, production-ready ecosystem for modern hospitality management.

## 🏗 What Makes It Special?

* 🔹 **Granular Inventory Management**: Three distinct booking layers—Hotels 🏨, Individual Rooms 🛌, and Full Apartments 🏢—each with custom pricing, availability calendars, and amenity sets
* 🔹 **Infinite Scroll & Performance**: Custom hooks for lightning-fast browsing with debounced search across hotels, apartments, and reviews 🔄
* 🔹 **Atomic Booking Logic**: Advanced date-overlap detection prevents double-bookings with transaction-based operations 🔒
* 🔹 **Seamless Financials**: Fully integrated PayPal SDK 💳 for secure real-time payments with status tracking
* 🔹 **Rock-Solid Validation**: Zod 🛡 for frontend validation + comprehensive backend checks with Prisma ORM & PostgreSQL
* 🔹 **Smart Availability System**: Manual calendar blocking, automatic conflict detection, and bulk date operations 📅
* 🔹 **Powerful Admin Dashboard**: Real-time analytics, Featured Hotels ⭐, role-based access control, and complete property management
* 🔹 **User Reviews**: One-review-per-booking system with ratings and average calculations 💬
* 🔹 **Advanced Filtering**: Multi-parameter search with price ranges, amenities, location, and real-time availability 🔍
* 🔹 **Glassmorphism Design System**: Custom SCSS architecture with modular component styling, reusable mixins for responsive breakpoints, and smooth animations powered by SASS variables and functions 🎨

## 🛠 Tech Stack

### ⚛️ Frontend

* React 19
* TypeScript
* Redux Toolkit + RTK Query
* React Router v7
* React Hook Form + Zod
* SCSS Modules
* Vite
* Custom Hooks (useDebouncing, useInfiniteScroll)

### 🟢 Backend

* Node.js + Express
* JWT Auth
* Role-Based Access Control
* Rate Limiting
* Helmet.js Security

### 🗄️ Database & Cloud

* Prisma ORM + PostgreSQL
* Cloudinary
* PayPal SDK

## 💡 Technical Highlights

* 🧠 Built atomic transactions to prevent booking conflicts across apartment/room hierarchies
* 🧠 Mastered Redux Toolkit with normalized data and optimistic updates
* 🧠 Implemented intersection observers for infinite scroll with 500ms debounced search
* 🧠 Created flexible architecture where rooms can be booked individually or only as part of apartments
