import { useState, useEffect, lazy, Suspense } from "react";
import {
  Plus,
  Filter,
  X,
  Trash2,
  Edit,
  Bed,
  Bath,
  Users,
  ChevronDown,
  Search,
  LayoutGrid,
  MapPin,
  Maximize2,
  AlertCircle,
} from "lucide-react";
import "./apartments.scss";
import {
  useGetApartmentsQuery,
  useDeleteApartmentMutation,
} from "../../slice/apartmentSlice";
import { useGetHotelsQuery } from "../../../../../features/hotels/slice/HotelSlice";
import Loader from "../../../../../components/loader/Loader";

const CreateApartments = lazy(
  () => import("../../components/create-apartments/CreateApartments")
);
const UpdateApartments = lazy(
  () => import("../../components/update-apartments/UpdateApartments")
);

import type { Apartment, ApartmentType } from "../../../../../types";
import toast from "react-hot-toast";
import { useDebouncing } from "../../../../../hooks/useDebouncing";
import { useInfiniteScroll } from "../../../../../hooks/useInfiniteScroll";
import InfiniteScrollFooter from "../../../../../components/infinite-scroll-footer/InfiniteScrollFooter";

const UnitSkeleton = () => (
  <div className="unit-card skeleton">
    <div className="unit-card__media skeleton-pulse">
      <div className="skeleton-badge skeleton-pulse" />
    </div>
    <div className="unit-card__body">
      <div className="unit-card__header">
        <div className="unit-card__titles">
          <div className="skeleton-text h1 skeleton-pulse" />
          <div className="skeleton-text h2 skeleton-pulse" />
        </div>
        <div className="unit-card__price">
          <div className="skeleton-price skeleton-pulse" />
        </div>
      </div>
      <div className="skeleton-text p skeleton-pulse" />
      <div className="unit-card__features">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-chip skeleton-pulse" />
        ))}
      </div>
      <div className="unit-card__footer">
        <div className="skeleton-badge skeleton-pulse" />
        <div className="unit-card__actions">
          <div className="skeleton-btn skeleton-pulse" />
          <div
            className="skeleton-btn skeleton-pulse"
            style={{ width: "40px" }}
          />
        </div>
      </div>
    </div>
  </div>
);

const Apartments = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null
  );

  // Filters & Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hotelId, setHotelId] = useState("");
  const [type, setType] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncing(search, 500);

  const [showFilters, setShowFilters] = useState(false);

  const {
    data: apartmentsData,
    isLoading,
    isFetching,
    error: isError,
  } = useGetApartmentsQuery({
    page,
    limit,
    hotelId: hotelId || undefined,
    apartmentType: (type as ApartmentType) || undefined,
    isAvailable: isAvailable !== null ? isAvailable : undefined,
    search: debouncedSearch || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  });

  const { data: hotelsData } = useGetHotelsQuery({ limit: 100 });
  const hotels = hotelsData?.hotels || [];
  const apartments = apartmentsData?.apartments || [];

  const [deleteApartment, { isLoading: isDeleting }] =
    useDeleteApartmentMutation();

  useEffect(() => {
    setPage(1);
  }, [hotelId, type, isAvailable, debouncedSearch, minPrice, maxPrice]);

  const loadMore = () => {
    if (
      apartmentsData?.pagination &&
      page < apartmentsData.pagination.totalPages &&
      !isFetching
    ) {
      setPage((prev) => prev + 1);
    }
  };

  const observerTarget = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: apartmentsData
      ? page < apartmentsData.pagination.totalPages
      : false,
    isLoading: isFetching,
  });

  const handleDelete = async (id: string, name: string) => {
    if (
      window.confirm(`Are you sure you want to delete apartment "${name}"?`)
    ) {
      try {
        await deleteApartment(id).unwrap();
        toast.success("Apartment deleted successfully");
      } catch {
        toast.error("Failed to delete apartment");
      }
    }
  };

  const handleUpdate = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setIsUpdateModalOpen(true);
  };

  const clearFilters = () => {
    setHotelId("");
    setType("");
    setIsAvailable(null);
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
  };

  const hasActiveFilters =
    hotelId || type || isAvailable !== null || search || minPrice || maxPrice;
  const hasMore = apartmentsData
    ? page < apartmentsData.pagination.totalPages
    : false;

  return (
    <div className="apartments-container">
      <header className="page-header">
        <div className="page-header__main">
          <div className="page-header__title">
            <h1>Units Management</h1>
            <span className="count-badge">
              {apartmentsData?.pagination?.total || 0} Total Units
            </span>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="add-btn"
          >
            <Plus size={20} />
            <span>Add Apartment</span>
          </button>
        </div>
      </header>

      <div className="management-controls">
        <div className="search-and-filter">
          <div className="search-field">
            <Search size={18} className="search-field__icon" />
            <input
              type="text"
              placeholder="Search by name, number or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-search" onClick={() => setSearch("")}>
                <X size={16} />
              </button>
            )}
          </div>
          <button
            className={`filter-btn ${showFilters ? "active" : ""} ${
              hasActiveFilters ? "has-active" : ""
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            <span>Filters</span>
            {hasActiveFilters && <span className="active-dot" />}
            <ChevronDown size={14} className={showFilters ? "rotate" : ""} />
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filters-panel__grid">
              <div className="form-group">
                <label>Property</label>
                <select
                  value={hotelId}
                  onChange={(e) => setHotelId(e.target.value)}
                >
                  <option value="">All Hotels</option>
                  {hotels?.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Unit Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">All Types</option>
                  <option value="STUDIO">Studio</option>
                  <option value="ONE_BEDROOM">1 Bedroom</option>
                  <option value="TWO_BEDROOM">2 Bedroom</option>
                  <option value="THREE_BEDROOM">3 Bedroom</option>
                  <option value="PENTHOUSE">Penthouse</option>
                  <option value="SUITE">Suite</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={isAvailable === null ? "" : String(isAvailable)}
                  onChange={(e) =>
                    setIsAvailable(
                      e.target.value === "" ? null : e.target.value === "true"
                    )
                  }
                >
                  <option value="">All Status</option>
                  <option value="true">Available</option>
                  <option value="false">Busy</option>
                </select>
              </div>

              <div className="form-group">
                <label>Min Price</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Max Price</label>
                <input
                  type="number"
                  placeholder="Any"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="filters-panel__footer">
              <button className="reset-link" onClick={clearFilters}>
                Reset all filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="units-list">
        {isLoading || isFetching ? (
          [...Array(limit)].map((_, i) => <UnitSkeleton key={i} />)
        ) : isError ? (
          <div className="empty-state error">
            <AlertCircle size={48} />
            <h3>Failed to load units</h3>
            <p>Please try again later or refresh the page.</p>
          </div>
        ) : apartments.length === 0 ? (
          <div className="empty-state">
            <LayoutGrid size={48} />
            <h3>No units found</h3>
            <p>
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
            {hasActiveFilters && (
              <button className="reset-link" onClick={clearFilters}>
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          apartments.map((apartment) => (
            <div key={apartment.id} className="unit-card">
              <div className="unit-card__media">
                {apartment.images?.[0] ? (
                  <img src={apartment.images[0]} alt={apartment.name} />
                ) : (
                  <div className="media-placeholder">
                    <LayoutGrid size={32} />
                  </div>
                )}
                <div
                  className={`unit-badge ${
                    apartment.isAvailable ? "is-available" : "is-busy"
                  }`}
                >
                  {apartment.isAvailable ? "Available" : "Busy"}
                </div>
              </div>

              <div className="unit-card__body">
                <div className="unit-card__header">
                  <div className="unit-card__titles">
                    <h2 className="unit-card__name">{apartment.name}</h2>
                    <div className="unit-card__hotel">
                      <MapPin size={14} />
                      <span>
                        {apartment.hotel?.name || "Independent Property"}
                      </span>
                    </div>
                  </div>
                  <div className="unit-card__price">
                    <span className="price-val">
                      ${apartment.pricePerNight}
                    </span>
                    <span className="price-label">/ night</span>
                  </div>
                </div>

                <p className="unit-card__desc">{apartment.description}</p>

                <div className="unit-card__features">
                  <div className="feature">
                    <Users size={14} />
                    <span>{apartment.totalCapacity} Guests</span>
                  </div>
                  <div className="feature">
                    <Bed size={14} />
                    <span>{apartment.numberOfBedrooms} Br</span>
                  </div>
                  <div className="feature">
                    <Bath size={14} />
                    <span>{apartment.numberOfBathrooms} Ba</span>
                  </div>
                  {apartment.areaSqm && (
                    <div className="feature">
                      <Maximize2 size={14} />
                      <span>{Number(apartment.areaSqm)} m²</span>
                    </div>
                  )}
                </div>

                <div className="unit-card__footer">
                  <div className="unit-type-tag">
                    {apartment.apartmentType.replace("_", " ")}
                  </div>
                  <div className="unit-card__actions">
                    <button
                      onClick={() => handleUpdate(apartment)}
                      className="action-btn edit"
                      title="Edit details"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(apartment.id, apartment.name)}
                      className="action-btn delete"
                      disabled={isDeleting}
                      title="Delete unit"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <InfiniteScrollFooter
        isFetching={isFetching}
        hasMore={hasMore}
        observerRef={observerTarget as any}
        endMessage="No more units found."
      />

      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setIsCreateModalOpen(false)}
            >
              <X size={24} />
            </button>
            <Suspense fallback={<Loader />}>
              <CreateApartments onClose={() => setIsCreateModalOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}

      {isUpdateModalOpen && selectedApartment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setIsUpdateModalOpen(false)}
            >
              <X size={24} />
            </button>
            <Suspense fallback={<Loader />}>
              <UpdateApartments
                apartment={selectedApartment}
                onClose={() => setIsUpdateModalOpen(false)}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default Apartments;
