import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetHotelsQuery } from "../../slice/HotelSlice";
import HotelCard from "../../components/hotel-card/HotelCard";
import Filters from "../../components/filters/Filters";
import Loader from "../../../../components/loader/Loader";
import { useDebouncing } from "../../../../hooks/useDebouncing";
import { useInfiniteScroll } from "../../../../hooks/useInfiniteScroll";
import InfiniteScrollFooter from "../../../../components/infinite-scroll-footer/InfiniteScrollFooter";
import "./hotels.scss";

const Hotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebouncing(searchTerm, 800);

  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    country: searchParams.get("country") || "",
    minRating: searchParams.get("minRating")
      ? Number(searchParams.get("minRating"))
      : undefined,
    amenities: searchParams.get("amenities") || "",
  });

  const [sortConfig, setSortConfig] = useState<{
    sortBy: string;
    order: "asc" | "desc";
  }>({
    sortBy: searchParams.get("sortBy") || "createdAt",
    order: (searchParams.get("order") as "asc" | "desc") || "desc",
  });

  const { data, isLoading, error, isFetching } = useGetHotelsQuery({
    page,
    limit: 6,
    ...filters,
    search: debouncedSearch,
    sortBy: sortConfig.sortBy,
    order: sortConfig.order,
  });

  const loadMore = () => {
    if (data?.pagination && page < data.pagination.totalPages && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const hasMore = data ? page < data.pagination.totalPages : false;

  const observerTarget = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isFetching,
  });

  // Sync state when URL parameters change (e.g. back button or external update)
  useEffect(() => {
    const city = searchParams.get("city") || "";
    const country = searchParams.get("country") || "";
    const minRating = searchParams.get("minRating")
      ? Number(searchParams.get("minRating"))
      : undefined;
    const amenities = searchParams.get("amenities") || "";
    const search = searchParams.get("search") || "";

    setFilters({ city, country, minRating, amenities });
    setSearchTerm(search);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    // Update or remove filter params
    if (filters.city) params.set("city", filters.city);
    else params.delete("city");
    if (filters.country) params.set("country", filters.country);
    else params.delete("country");
    if (filters.minRating)
      params.set("minRating", filters.minRating.toString());
    else params.delete("minRating");
    if (filters.amenities) params.set("amenities", filters.amenities);
    else params.delete("amenities");

    // Update or remove search param
    if (debouncedSearch) params.set("search", debouncedSearch);
    else params.delete("search");

    // Add sort params
    params.set("sortBy", sortConfig.sortBy);
    params.set("order", sortConfig.order);

    // Only update if something actually changed to avoid infinite loops
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params);
    }
  }, [filters, debouncedSearch, sortConfig, searchParams, setSearchParams]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    switch (value) {
      case "price-asc":
        setSortConfig({ sortBy: "price", order: "asc" });
        break;
      case "price-desc":
        setSortConfig({ sortBy: "price", order: "desc" });
        break;
      case "rating-desc":
        setSortConfig({ sortBy: "rating", order: "desc" });
        break;
      case "rating-asc":
        setSortConfig({ sortBy: "rating", order: "asc" });
        break;
      case "name-asc":
        setSortConfig({ sortBy: "name", order: "asc" });
        break;
      case "name-desc":
        setSortConfig({ sortBy: "name", order: "desc" });
        break;
      case "newest":
        setSortConfig({ sortBy: "createdAt", order: "desc" });
        break;
      default:
        setSortConfig({ sortBy: "createdAt", order: "desc" });
    }
  };

  return (
    <div className="hotels">
      <div className="hotels__container">
        <div className="hotels__header">
          <h1 className="hotels__title">Explore Hotels</h1>
          <p className="hotels__subtitle">
            Find your perfect accommodation from our collection of luxury hotels
          </p>
          <div className="hotels__search-bar">
            <input
              type="text"
              placeholder="Search by name, description, address..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="hotels__search-input"
            />
            <span className="hotels__search-icon">🔍</span>
          </div>
        </div>

        <div className="hotels__layout">
          <Filters filters={filters} onFilterChange={handleFilterChange} />

          <div className="hotels__content">
            <div className="hotels__results-header">
              <p className="hotels__results-count">
                {data?.pagination?.total || 0} hotels found
              </p>

              <div className="hotels__sort">
                <label htmlFor="sort">Sort by:</label>
                <select
                  id="sort"
                  value={
                    `${sortConfig.sortBy}-${sortConfig.order}` ===
                    "createdAt-desc"
                      ? "newest"
                      : `${sortConfig.sortBy}-${sortConfig.order}`
                  }
                  onChange={handleSortChange}
                >
                  <option value="newest">Newest Added</option>
                  <option value="rating-desc">Rating (High to Low)</option>
                  <option value="rating-asc">Rating (Low to High)</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="hotels__loading">
                <Loader text="Loading hotels..." />
              </div>
            ) : error ? (
              <div className="hotels__error">
                Failed to load hotels. Please try again later.
              </div>
            ) : data?.hotels && data.hotels.length > 0 ? (
              <>
                <div
                  className={`hotels__grid ${
                    isFetching ? "hotels__grid--fetching" : ""
                  }`}
                >
                  {data.hotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>

                <InfiniteScrollFooter
                  isFetching={isFetching}
                  hasMore={hasMore}
                  observerRef={observerTarget as any}
                  endMessage="No more hotels found."
                />
              </>
            ) : (
              <div className="hotels__empty">
                No hotels found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hotels;
