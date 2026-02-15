import { useState, useEffect, lazy, Suspense } from "react";
import { useDebouncing } from "../../../../../hooks/useDebouncing";
import { useInfiniteScroll } from "../../../../../hooks/useInfiniteScroll";
import InfiniteScrollFooter from "../../../../../components/infinite-scroll-footer/InfiniteScrollFooter";
import "./hotels.scss";
import {
  useGetHotelsQuery,
  useDeleteHotelMutation,
} from "../../../../../features/hotels/slice/HotelSlice";
import Loader from "../../../../../components/loader/Loader";

const CreateHotels = lazy(
  () => import("../../components/create-hotels/CreateHotels")
);
const UpdateHotels = lazy(
  () => import("../../components/update-hotels/UpdateHotels")
);
import type { Hotel } from "../../../../../types";
import {
  Building,
  DoorOpen,
  Star,
  MapPin,
  Filter,
  X,
  Plus,
} from "lucide-react";

const HotelSkeleton = () => (
  <div className="hotel-card skeleton">
    <div className="card-image skeleton-pulse"></div>
    <div className="card-content">
      <div className="skeleton-text title skeleton-pulse"></div>
      <div className="skeleton-text subtitle skeleton-pulse"></div>
      <div className="skeleton-text body skeleton-pulse"></div>
    </div>
    <div className="card-actions">
      <div className="skeleton-btn skeleton-pulse"></div>
      <div className="skeleton-btn skeleton-pulse"></div>
    </div>
  </div>
);

const Hotels = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncing(searchTerm);

  // Filter States
  const [isActive, setIsActive] = useState<string>("");
  const [minRating, setMinRating] = useState<number>(0);
  const [city, setCity] = useState("");
  const debouncedCity = useDebouncing(city, 800);

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, isActive, minRating, debouncedCity]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  const {
    data: hotelsData,
    isLoading,
    isFetching,
  } = useGetHotelsQuery({
    page,
    limit: 10,
    search: debouncedSearch,
    isActive:
      isActive === "active"
        ? true
        : isActive === "inactive"
        ? false
        : undefined,
    minRating: minRating > 0 ? minRating : undefined,
    city: debouncedCity || undefined,
  });

  const [deleteHotel] = useDeleteHotelMutation();

  const loadMore = () => {
    if (
      hotelsData?.pagination &&
      page < hotelsData.pagination.totalPages &&
      !isFetching
    ) {
      setPage((prev) => prev + 1);
    }
  };

  const observerTarget = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: hotelsData ? page < hotelsData.pagination.totalPages : false,
    isLoading: isFetching,
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this hotel?")) {
      await deleteHotel(id);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setIsActive("");
    setMinRating(0);
    setCity("");
  };

  const hasActiveFilters = searchTerm || isActive || minRating > 0 || city;

  return (
    <div className="hotels-container">
      <div className="header">
        <h1>Hotels Management</h1>
        <button
          className="create-btn"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={18} />
          Add New Hotel
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search hotels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-group">
          <select
            value={isActive}
            onChange={(e) => setIsActive(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="filter-select"
          >
            <option value={0}>All Ratings</option>
            <option value={3}>3+ Stars</option>
            <option value={4}>4+ Stars</option>
            <option value={5}>5 Stars</option>
          </select>

          <input
            type="text"
            placeholder="Filter by City..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="filter-input"
          />

          {hasActiveFilters && (
            <button onClick={clearFilters} className="clear-filters-btn">
              <X size={16} /> Clear
            </button>
          )}
        </div>
      </div>

      {isLoading && page === 1 ? (
        <div className="hotels-grid">
          {[...Array(6)].map((_, i) => (
            <HotelSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="hotels-grid">
            {hotelsData?.hotels?.length === 0 ? (
              <div className="empty-state">
                <Filter className="empty-icon" />
                <h3>No hotels found</h3>
                <p>Try adjusting your search or filters</p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="clear-link">
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              hotelsData?.hotels?.map((hotel) => (
                <div key={hotel.id} className="hotel-card">
                  <div className="card-image">
                    {hotel.images && hotel.images.length > 0 ? (
                      <img src={hotel.images[0]} alt={hotel.name} />
                    ) : (
                      <div className="placeholder-image">No Image</div>
                    )}
                    {hotel.isFeatured && (
                      <span className="featured-badge">Featured</span>
                    )}
                    {!hotel.isActive && (
                      <span className="status-badge inactive">Inactive</span>
                    )}
                  </div>

                  <div className="card-content">
                    <div className="hotel-header">
                      <h3>{hotel.name}</h3>
                      <div className="rating">
                        <Star
                          size={14}
                          className="star-icon"
                          fill="currentColor"
                        />{" "}
                        {hotel.rating}
                      </div>
                    </div>

                    <p className="location">
                      <MapPin size={14} className="icon" /> {hotel.city},{" "}
                      {hotel.country}
                    </p>
                    <p className="description">
                      {hotel.description?.substring(0, 100)}...
                    </p>

                    <div className="stats">
                      <span title="Apartments">
                        <Building size={14} /> {hotel._count?.apartments || 0}{" "}
                        Apts
                      </span>
                      <span title="Rooms">
                        <DoorOpen size={14} /> {hotel._count?.rooms || 0} Rooms
                      </span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="edit-btn"
                      onClick={() => setEditingHotel(hotel)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(hotel.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <InfiniteScrollFooter
            isFetching={isFetching}
            hasMore={
              hotelsData ? page < hotelsData.pagination.totalPages : false
            }
            observerRef={observerTarget as any}
            endMessage="No more hotels found."
          />
        </>
      )}

      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setIsCreateModalOpen(false)}
            >
              &times;
            </button>
            <Suspense fallback={<Loader />}>
              <CreateHotels onClose={() => setIsCreateModalOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}

      {editingHotel && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setEditingHotel(null)}
            >
              &times;
            </button>
            <Suspense fallback={<Loader />}>
              <UpdateHotels
                hotel={editingHotel}
                onClose={() => setEditingHotel(null)}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hotels;
