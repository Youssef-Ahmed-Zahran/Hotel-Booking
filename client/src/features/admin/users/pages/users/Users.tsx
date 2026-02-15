import { useState, useEffect, lazy, Suspense } from "react";
import "./users.scss";
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
} from "../../slice/userSlice";
import Loader from "../../../../../components/loader/Loader";

const UpdateUsers = lazy(
  () => import("../../components/update-users/UpdateUsers")
);

import type { User } from "../../../../../types";
import { useDebouncing } from "../../../../../hooks/useDebouncing";
import { useInfiniteScroll } from "../../../../../hooks/useInfiniteScroll";
import InfiniteScrollFooter from "../../../../../components/infinite-scroll-footer/InfiniteScrollFooter";
import {
  FiSearch,
  FiTrash2,
  FiEdit2,
  FiUsers,
  FiMail,
  FiCalendar,
  FiMessageSquare,
} from "react-icons/fi";

const Users = () => {
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncing(searchQuery, 500);

  const {
    data: usersData,
    isLoading,
    isFetching,
  } = useGetAllUsersQuery({
    page,
    limit: 10,
    search: debouncedSearch,
  });

  // Reset page to 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const users = usersData?.users || [];
  const hasMore = usersData?.pagination
    ? page < usersData.pagination.totalPages
    : false;

  const [deleteUser] = useDeleteUserMutation();

  const loadMore = () => {
    if (hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const scrollTargetRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isFetching,
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser(id);
    }
  };

  return (
    <div className="users-page-wrapper">
      <div className="users-header-section">
        <div className="header-content">
          <h1>
            <FiUsers className="icon" />
            Users Management
          </h1>
          <p>Manage and monitor your application users</p>
        </div>
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="users-modern-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact Info</th>
                <th>Role</th>
                <th>Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    <div className="empty-message">
                      No users found matching your search.
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user: User) => (
                  <tr key={user.id} className="user-row">
                    <td className="user-info-cell">
                      <div className="user-profile-info">
                        {user.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt={user.username}
                            className="user-avatar"
                          />
                        ) : (
                          <div className="user-avatar-placeholder">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="name-stack">
                          <span className="full-name">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="username">@{user.username}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-stack">
                        <div className="contact-item">
                          <FiMail className="icon" />
                          <span>{user.email}</span>
                        </div>
                        {user.phoneNumber && (
                          <div className="contact-item">
                            <span>📞 {user.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`role-tag ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="activity-stats">
                        <div className="stat-pill" title="Bookings">
                          <FiCalendar className="icon" />
                          <span>{user._count?.bookings || 0}</span>
                        </div>
                        <div className="stat-pill" title="Reviews">
                          <FiMessageSquare className="icon" />
                          <span>{user._count?.reviews || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn edit"
                          onClick={() => setEditingUser(user)}
                          title="Edit User"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(user.id)}
                          title="Delete User"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <InfiniteScrollFooter
          isFetching={isFetching}
          hasMore={hasMore}
          observerRef={scrollTargetRef as any}
          endMessage="No more users to load."
        />
      </div>

      {editingUser && (
        <div className="user-modal-overlay">
          <div className="user-modal-container">
            <button
              className="close-modal-btn"
              onClick={() => setEditingUser(null)}
            >
              &times;
            </button>
            <Suspense fallback={<Loader />}>
              <UpdateUsers
                user={editingUser}
                onClose={() => setEditingUser(null)}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
