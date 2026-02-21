

https://github.com/user-attachments/assets/c672fe03-cdcb-4821-85f9-721c61418ac5

# 🚀 Full-Stack Hotel Booking Platform

A complete Hotel Booking & Management System—a fully functional, production-ready ecosystem for modern hospitality management with advanced inventory control and real-time booking capabilities.

## 🎯 Project Overview

A comprehensive hotel booking platform designed for scalability and performance, featuring multi-layered inventory management, atomic booking transactions, and a powerful admin dashboard. Built to handle complex booking scenarios with enterprise-grade security and seamless payment integration.

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

### Frontend

* ⚛️ React 19
* 📘 TypeScript
* 🔄 Redux Toolkit + RTK Query
* 🧭 React Router v7
* 📋 React Hook Form + Zod
* 🎨 SCSS Modules
* ⚡ Vite
* 🪝 Custom Hooks (useDebouncing, useInfiniteScroll)

### Backend

* 🟢 Node.js + Express
* 🔐 JWT Authentication
* 👮 Role-Based Access Control (RBAC)
* 🚫 Rate Limiting
* 🛡️ Helmet.js Security

### Database & Cloud

* 🗄️ Prisma ORM + PostgreSQL
* ☁️ Cloudinary
* 💳 PayPal SDK

## 💡 Technical Highlights

* 🧠 Built atomic transactions to prevent booking conflicts across apartment/room hierarchies
* 🧠 Mastered Redux Toolkit with normalized data and optimistic updates
* 🧠 Implemented intersection observers for infinite scroll with 500ms debounced search
* 🧠 Created flexible architecture where rooms can be booked individually or only as part of apartments

## ⚡ Key Features

### For Guests

* 🔍 Advanced search with multi-parameter filtering (price, location, amenities, dates)
* 📅 Real-time availability calendar with instant feedback
* 💳 Secure payment processing via PayPal integration
* 📱 Fully responsive design across all devices
* ⭐ Review and rating system for properties
* 🔔 Booking confirmation and status tracking
* 🏨 Browse hotels, individual rooms, or full apartments

### For Property Managers

* 📊 Real-time analytics dashboard with booking insights
* 🏢 Multi-property management system
* 📅 Manual calendar blocking and availability control
* 💰 Revenue tracking and financial reports
* ⭐ Featured property promotion system
* 👥 Guest management and booking history
* 🔧 Bulk operations for pricing and availability updates

### For Administrators

* 👮 Role-based access control with granular permissions
* 🏨 Complete hotel and property approval system
* 📈 Platform-wide analytics and reporting
* 👤 User management with security controls
* 💬 Review moderation and content management
* 🛡️ Security monitoring and rate limit controls

## 🏗️ Architecture Highlights

### Performance Optimizations

* ⚡ Debounced search with 500ms delay for optimal UX
* 🔄 Infinite scroll with intersection observers
* 💾 Normalized Redux state for efficient data management
* 🎯 Optimistic UI updates for instant feedback
* 📦 Code splitting and lazy loading
* 🖼️ Cloudinary image optimization

### Security Features

* 🔒 JWT-based authentication with HTTP-only cookies
* 🛡️ Helmet.js for HTTP headers security
* 🚫 Rate limiting to prevent abuse
* 👮 Role-based access control (RBAC)
* ✅ Input validation with Zod (frontend) and Prisma (backend)
* 🔐 SQL injection prevention via Prisma ORM

### Booking System

* 🔒 Atomic transactions for booking integrity
* 📅 Advanced date-overlap detection
* 🚫 Automatic conflict prevention
* 💰 Real-time payment status tracking
* 📧 Booking confirmation system
* 🔙 Cancellation and refund handling

### Data Management

* 🗄️ PostgreSQL with Prisma ORM
* 🔄 Normalized data structure in Redux
* 📊 Efficient querying with indexes
* 💾 Optimistic updates with RTK Query
* 🔄 Automatic cache invalidation
* 📈 Aggregated statistics and analytics

## 🎨 Design System

### SCSS Architecture

* 📁 Modular component-scoped styling
* 🎨 Custom Glassmorphism design system
* 📐 Reusable mixins for responsive breakpoints
* 🎭 Smooth animations with SASS variables
* 🎯 Utility functions for consistent spacing
* 🌈 Theme variables for easy customization

## 📦 Custom Hooks & Utilities

* 🪝 **useDebouncing**: Optimized search performance
* 🪝 **useInfiniteScroll**: Intersection observer-based pagination
* 🪝 **useAuth**: Authentication state management
* 🪝 **useBooking**: Booking flow orchestration
* 🪝 **useCalendar**: Date selection and availability logic

## 🔧 Advanced Functionality

### Inventory Management

* 🏨 Three-tier booking system (Hotels → Apartments → Rooms)
* 📅 Custom pricing calendars per property
* 🛏️ Flexible room booking (individual or apartment-only)
* 🏷️ Amenity management and filtering
* 📊 Capacity tracking and occupancy rates

### Payment Integration

* 💳 PayPal SDK integration
* 💰 Real-time payment processing
* 📈 Transaction status tracking
* 🔙 Refund handling
* 🧾 Invoice generation

### Review System

* ⭐ One-review-per-booking policy
* 📊 Average rating calculations
* 💬 Review moderation tools
* 🔍 Review filtering and sorting
* 📈 Rating analytics for properties
