import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterMutation } from "../../slice/authSlice";
import toast from "react-hot-toast";
import "./registerForm.scss";

import {
  registerSchema,
  type RegisterFormData,
} from "../../../../validation/auth";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData).unwrap();
      toast.success("Registration successful!");
      navigate("/");
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="register-form">
      <div className="register-form__header">
        <h2 className="register-form__title">Create Account</h2>
        <p className="register-form__subtitle">Join us today</p>
      </div>

      <form className="register-form__form" onSubmit={handleSubmit(onSubmit)}>
        <div className="register-form__row">
          <div className="register-form__field">
            <label htmlFor="firstName" className="register-form__label">
              First Name
            </label>
            <input
              {...register("firstName")}
              type="text"
              id="firstName"
              className="register-form__input"
              placeholder="John"
            />
          </div>

          <div className="register-form__field">
            <label htmlFor="lastName" className="register-form__label">
              Last Name
            </label>
            <input
              {...register("lastName")}
              type="text"
              id="lastName"
              className="register-form__input"
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="register-form__field">
          <label htmlFor="username" className="register-form__label">
            Username *
          </label>
          <input
            {...register("username")}
            type="text"
            id="username"
            className={`register-form__input ${
              errors.username ? "has-error" : ""
            }`}
            placeholder="johndoe"
          />
          {errors.username && (
            <span className="register-form__error">
              {errors.username.message}
            </span>
          )}
        </div>

        <div className="register-form__field">
          <label htmlFor="email" className="register-form__label">
            Email Address *
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            className={`register-form__input ${
              errors.email ? "has-error" : ""
            }`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <span className="register-form__error">{errors.email.message}</span>
          )}
        </div>

        <div className="register-form__field">
          <label htmlFor="phoneNumber" className="register-form__label">
            Phone Number
          </label>
          <input
            {...register("phoneNumber")}
            type="tel"
            id="phoneNumber"
            className="register-form__input"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="register-form__field">
          <label htmlFor="password" className="register-form__label">
            Password *
          </label>
          <input
            {...register("password")}
            type="password"
            id="password"
            className={`register-form__input ${
              errors.password ? "has-error" : ""
            }`}
            placeholder="••••••••"
          />
          {errors.password && (
            <span className="register-form__error">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="register-form__field">
          <label htmlFor="confirmPassword" className="register-form__label">
            Confirm Password *
          </label>
          <input
            {...register("confirmPassword")}
            type="password"
            id="confirmPassword"
            className={`register-form__input ${
              errors.confirmPassword ? "has-error" : ""
            }`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <span className="register-form__error">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="register-form__submit"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="register-form__footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
};

export default RegisterForm;
