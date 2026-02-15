import { useState, useEffect } from "react";
import { useGetAllAmenitiesQuery } from "../../../admin/amenitys/slice/amenitySlice";
import "./filters.scss";

interface FiltersProps {
  filters: {
    city: string;
    country: string;
    minRating?: number;
    amenities?: string;
  };
  onFilterChange: (filters: any) => void;
}

const Filters = ({ filters, onFilterChange }: FiltersProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync local filters when props change (e.g. from URL or external reset)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const { data: amenities } = useGetAllAmenitiesQuery();

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      city: "",
      country: "",
      minRating: undefined,
      amenities: "",
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const toggleAmenity = (amenityId: string) => {
    const currentAmenities = localFilters.amenities
      ? localFilters.amenities.split(",")
      : [];
    const newAmenities = currentAmenities.includes(amenityId)
      ? currentAmenities.filter((id: string) => id !== amenityId)
      : [...currentAmenities, amenityId];

    setLocalFilters({
      ...localFilters,
      amenities: newAmenities.join(","),
    });
  };

  const ratings = [3, 4, 5];

  return (
    <div className="filters">
      <h3 className="filters__title">Filters</h3>

      <div className="filters__section">
        <h4 className="filters__section-title">Location</h4>

        <div className="filters__field">
          <label htmlFor="city" className="filters__label">
            City
          </label>
          <input
            type="text"
            id="city"
            className="filters__input"
            placeholder="Enter city"
            value={localFilters.city}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, city: e.target.value })
            }
          />
        </div>

        <div className="filters__field">
          <label htmlFor="country" className="filters__label">
            Country
          </label>
          <input
            type="text"
            id="country"
            className="filters__input"
            placeholder="Enter country"
            value={localFilters.country}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, country: e.target.value })
            }
          />
        </div>
      </div>

      <div className="filters__section">
        <h4 className="filters__section-title">Amenities</h4>
        <div className="filters__amenities">
          {amenities && amenities.length > 0 ? (
            amenities.map((amenity) => (
              <label key={amenity.id} className="filters__checkbox-label">
                <input
                  type="checkbox"
                  checked={
                    localFilters.amenities?.split(",").includes(amenity.id) ||
                    false
                  }
                  onChange={() => toggleAmenity(amenity.id)}
                  className="filters__checkbox"
                />
                <span className="filters__checkbox-text">{amenity.name}</span>
              </label>
            ))
          ) : (
            <p className="filters__no-data">No amenities available</p>
          )}
        </div>
      </div>

      <div className="filters__section">
        <h4 className="filters__section-title">Minimum Rating</h4>
        <div className="filters__rating">
          {ratings.map((rating) => (
            <button
              key={rating}
              className={`filters__rating-btn ${
                localFilters.minRating === rating ? "active" : ""
              }`}
              onClick={() =>
                setLocalFilters({ ...localFilters, minRating: rating })
              }
            >
              {rating}+ ⭐
            </button>
          ))}
        </div>
      </div>

      <div className="filters__actions">
        <button
          className="filters__btn filters__btn--apply"
          onClick={handleApply}
        >
          Apply Filters
        </button>
        <button
          className="filters__btn filters__btn--clear"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default Filters;
