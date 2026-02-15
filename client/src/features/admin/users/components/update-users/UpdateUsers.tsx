import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "./updateUsers.scss";
import { useUpdateUserMutation } from "../../slice/userSlice";
import type { User } from "../../../../../types";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiImage,
  FiShield,
  FiX,
  FiCheck,
} from "react-icons/fi";

import {
  userSchema,
  type UserFormData,
} from "../../../../../features/admin/validation/user";

interface UpdateUsersProps {
  user: User;
  onClose: () => void;
}

const UpdateUsers: React.FC<UpdateUsersProps> = ({ user, onClose }) => {
  const [updateUser, { isLoading, error }] = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username,
      email: user.email,
      role: user.role as "USER" | "ADMIN",
      phoneNumber: user.phoneNumber || "",
      profileImageUrl: user.profileImageUrl || "",
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: UserFormData) => {
    try {
      await updateUser({
        userId: user.id,
        ...data,
      }).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  return (
    <div className="update-user-wrapper">
      <div className="form-header">
        <div className="title-area">
          <h2>Edit User Profile</h2>
          <p>Modify account information and permissions</p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <FiX className="icon" />
          <span>Failed to update user. Please try again.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="modern-form">
        <div className="profile-preview-section">
          <div className="preview-container">
            {watchedValues.profileImageUrl ? (
              <img
                src={watchedValues.profileImageUrl}
                alt="Preview"
                className="profile-img"
              />
            ) : (
              <div className="profile-placeholder">
                {watchedValues.username
                  ? watchedValues.username.charAt(0).toUpperCase()
                  : "?"}
              </div>
            )}
            <div className="preview-label">
              <FiImage />
              <span>Preview</span>
            </div>
          </div>
          <div className="preview-info">
            <h3>
              {watchedValues.firstName} {watchedValues.lastName}
            </h3>
            <p>@{watchedValues.username}</p>
            <span className={`role-badge ${watchedValues.role.toLowerCase()}`}>
              {watchedValues.role}
            </span>
          </div>
        </div>

        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="firstName">First Name</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input
                {...register("firstName")}
                type="text"
                id="firstName"
                placeholder="Enter first name"
                className={errors.firstName ? "has-error" : ""}
              />
            </div>
            {errors.firstName && (
              <span className="error-message">{errors.firstName.message}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="lastName">Last Name</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input
                {...register("lastName")}
                type="text"
                id="lastName"
                placeholder="Enter last name"
                className={errors.lastName ? "has-error" : ""}
              />
            </div>
            {errors.lastName && (
              <span className="error-message">{errors.lastName.message}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <span className="at-symbol">@</span>
              <input
                {...register("username")}
                type="text"
                id="username"
                placeholder="username"
                className={errors.username ? "has-error" : ""}
              />
            </div>
            {errors.username && (
              <span className="error-message">{errors.username.message}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="role">User Role</label>
            <div className="input-wrapper">
              <FiShield className="input-icon" />
              <select id="role" {...register("role")}>
                <option value="USER">Standard User</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            {errors.role && (
              <span className="error-message">{errors.role.message}</span>
            )}
          </div>

          <div className="input-group full-width">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                {...register("email")}
                type="email"
                id="email"
                placeholder="email@example.com"
                className={errors.email ? "has-error" : ""}
              />
            </div>
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="input-group full-width">
            <label htmlFor="profileImageUrl">Profile Image URL</label>
            <div className="input-wrapper">
              <FiImage className="input-icon" />
              <input
                {...register("profileImageUrl")}
                type="url"
                id="profileImageUrl"
                placeholder="https://example.com/image.jpg"
                className={errors.profileImageUrl ? "has-error" : ""}
              />
            </div>
            {errors.profileImageUrl && (
              <span className="error-message">
                {errors.profileImageUrl.message}
              </span>
            )}
          </div>

          <div className="input-group full-width">
            <label htmlFor="phoneNumber">Phone Number</label>
            <div className="input-wrapper">
              <FiPhone className="input-icon" />
              <input
                {...register("phoneNumber")}
                type="tel"
                id="phoneNumber"
                placeholder="+1 (555) 000-0000"
                className={errors.phoneNumber ? "has-error" : ""}
              />
            </div>
            {errors.phoneNumber && (
              <span className="error-message">
                {errors.phoneNumber.message}
              </span>
            )}
          </div>
        </div>

        <div className="form-footer">
          <button type="button" onClick={onClose} className="btn-cancel">
            Discard Changes
          </button>
          <button type="submit" disabled={isLoading} className="btn-submit">
            {isLoading ? (
              <>
                <div className="btn-spinner"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FiCheck />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateUsers;
