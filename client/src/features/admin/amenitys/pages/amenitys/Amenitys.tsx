import { useState, lazy, Suspense } from "react";
import "./amenitys.scss";
import {
  useDeleteAmenityMutation,
  useGetAmenitiesByRoomQuery,
} from "../../slice/amenitySlice";
import { useGetRoomsQuery } from "../../../rooms/slice/roomSlice";
import Loader from "../../../../../components/loader/Loader";

const CreateAmenitys = lazy(
  () => import("../../components/create-amenitys/CreateAmenitys")
);
const UpdateAmenitys = lazy(
  () => import("../../components/update-amenitys/UpdateAmenitys")
);

import type { Amenity } from "../../../../../types";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

const Amenitys = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);

  const { data: roomsData } = useGetRoomsQuery({});
  const { data: amenities, isLoading } = useGetAmenitiesByRoomQuery(
    selectedRoomId,
    {
      skip: !selectedRoomId,
    }
  );

  const [deleteAmenity] = useDeleteAmenityMutation();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this amenity?")) {
      await deleteAmenity(id);
    }
  };

  return (
    <div className="amenities-container">
      <div className="amenities-header">
        <div className="header-content">
          <h1>Amenities Management</h1>
          <p>Manage and organize room amenities efficiently</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!selectedRoomId}
        >
          <FiPlus /> Add New Amenity
        </button>
      </div>

      <div className="controls-section">
        <div className="select-wrapper">
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="room-select"
          >
            <option value="">Select a Room</option>
            {roomsData?.rooms?.map((room) => (
              <option key={room.id} value={room.id}>
                {room.roomNumber} - {room.roomType}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="content-area">
        {isLoading ? (
          <Loader text="Loading amenities..." />
        ) : !selectedRoomId ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏨</div>
            <h3>Select a Room</h3>
            <p>
              Please select a room from the dropdown to view and manage its
              amenities.
            </p>
          </div>
        ) : amenities?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✨</div>
            <h3>No Amenities Found</h3>
            <p>This room has no amenities yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="amenities-grid">
            {amenities?.map((amenity) => (
              <div key={amenity.id} className="amenity-card fade-in">
                <div className="card-content">
                  <h3 className="amenity-name">{amenity.name}</h3>
                  <p className="amenity-description">{amenity.description}</p>
                </div>
                <div className="card-actions">
                  <button
                    className="icon-btn edit"
                    onClick={() => setEditingAmenity(amenity)}
                    title="Edit Amenity"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="icon-btn delete"
                    onClick={() => handleDelete(amenity.id)}
                    title="Delete Amenity"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <div className="modal-overlay fade-in">
          <div className="modal-content scale-in">
            <button
              className="close-modal"
              onClick={() => setIsCreateModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="modal-title">Add New Amenity</h2>
            <Suspense fallback={<Loader />}>
              <CreateAmenitys
                roomId={selectedRoomId}
                onClose={() => setIsCreateModalOpen(false)}
              />
            </Suspense>
          </div>
        </div>
      )}

      {editingAmenity && (
        <div className="modal-overlay fade-in">
          <div className="modal-content scale-in">
            <button
              className="close-modal"
              onClick={() => setEditingAmenity(null)}
            >
              &times;
            </button>
            <h2 className="modal-title">Edit Amenity</h2>
            <Suspense fallback={<Loader />}>
              <UpdateAmenitys
                amenity={editingAmenity}
                onClose={() => setEditingAmenity(null)}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default Amenitys;
