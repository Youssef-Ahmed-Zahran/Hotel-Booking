import { useState, useEffect, lazy, Suspense } from "react";
import "./rooms.scss";
import { useGetRoomsQuery, useDeleteRoomMutation } from "../../slice/roomSlice";
import Loader from "../../../../../components/loader/Loader";

const CreateRooms = lazy(
  () => import("../../components/create-rooms/CreateRooms")
);
const UpdateRooms = lazy(
  () => import("../../components/update-rooms/UpdateRooms")
);

import type { Room } from "../../../../../types";
import { useDebouncing } from "../../../../../hooks/useDebouncing";
import { useInfiniteScroll } from "../../../../../hooks/useInfiniteScroll";
import InfiniteScrollFooter from "../../../../../components/infinite-scroll-footer/InfiniteScrollFooter";

const Rooms = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncing(searchTerm, 500);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const {
    data: roomsData,
    isLoading,
    isFetching,
  } = useGetRoomsQuery({
    page,
    limit: 10,
    search: debouncedSearchTerm,
  });

  const [deleteRoom] = useDeleteRoomMutation();

  // Reset page to 1 when search term changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const filteredRooms = roomsData?.rooms || [];

  const hasMore = roomsData ? page < roomsData.pagination.totalPages : false;

  const loadMore = () => {
    if (hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const observerTarget = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isFetching,
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      await deleteRoom(id);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setPage(1);
  };

  return (
    <div className="rooms-container">
      <div className="page-header">
        <div className="page-header__main">
          <div className="page-header__title">
            <h1>Rooms Management</h1>
            {roomsData?.pagination && (
              <span className="count-badge">
                {roomsData.pagination.total} total rooms
              </span>
            )}
          </div>
          <button
            className="add-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span>+</span>
            Add New Room
          </button>
        </div>
      </div>

      <div className="management-controls">
        <div className="search-field">
          <svg
            className="search-field__icon"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search rooms by number, type, or location..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
          {searchTerm && (
            <button className="clear-search" onClick={clearSearch}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 5L5 15M5 5l10 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="rooms-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="room-card skeleton">
              <div className="room-card__media">
                <div className="skeleton-pulse"></div>
              </div>
              <div className="room-card__body">
                <div className="room-card__header">
                  <div className="room-card__titles">
                    <div className="skeleton-text h1"></div>
                    <div className="skeleton-text h2"></div>
                  </div>
                  <div className="skeleton-price"></div>
                </div>
                <div className="room-card__info">
                  <div className="skeleton-chip"></div>
                  <div className="skeleton-chip"></div>
                </div>
                <div className="skeleton-text p"></div>
                <div className="room-card__footer">
                  <div className="room-card__actions">
                    <div className="skeleton-btn"></div>
                    <div className="skeleton-btn"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredRooms?.length === 0 ? (
        <div className="empty-state">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 22V12h6v10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3>No rooms found</h3>
          <p>
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Get started by adding your first room"}
          </p>
        </div>
      ) : (
        <>
          <div className="rooms-grid">
            {filteredRooms?.map((room) => (
              <div key={room.id} className="room-card">
                <div className="room-card__media">
                  {room.images && room.images.length > 0 ? (
                    <img src={room.images[0]} alt={`Room ${room.roomNumber}`} />
                  ) : (
                    <div className="media-placeholder">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                  <span
                    className={`status-badge ${
                      room.isAvailable ? "available" : "unavailable"
                    }`}
                  >
                    {room.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div className="room-card__body">
                  <div className="room-card__header">
                    <div className="room-card__titles">
                      <h3 className="room-card__number">
                        Room {room.roomNumber}
                      </h3>
                      <div className="room-card__type">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{room.roomType}</span>
                      </div>
                    </div>
                    <div className="room-card__price">
                      <span className="price-val">${room.pricePerNight}</span>
                      <span className="price-label">per night</span>
                    </div>
                  </div>

                  <div className="room-card__info">
                    <div className="info-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="9"
                          cy="7"
                          r="4"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      <span>{room.capacity} guests</span>
                    </div>
                    {room.bookableIndividually && (
                      <div className="info-item">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M22 4L12 14.01l-3-3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>Bookable</span>
                      </div>
                    )}
                  </div>

                  {(room.hotel || room.apartment) && (
                    <p className="room-card__location">
                      {room.hotel && `🏨 ${room.hotel.name}`}
                      {room.apartment && ` • Apt ${room.apartment.name}`}
                    </p>
                  )}

                  <div className="room-card__footer">
                    <div className="room-card__actions">
                      <button
                        className="action-btn edit"
                        onClick={() => setEditingRoom(room)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(room.id)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <InfiniteScrollFooter
            isFetching={isFetching}
            hasMore={hasMore}
            observerRef={observerTarget as any}
            endMessage="No more rooms to load."
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
              ×
            </button>
            <Suspense fallback={<Loader />}>
              <CreateRooms onClose={() => setIsCreateModalOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}

      {editingRoom && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setEditingRoom(null)}
            >
              ×
            </button>
            <Suspense fallback={<Loader />}>
              <UpdateRooms
                room={editingRoom}
                onClose={() => setEditingRoom(null)}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
