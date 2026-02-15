import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "../../slice/authSlice";
import toast from "react-hot-toast";
import "./loginForm.scss";

import { loginSchema, type LoginFormData } from "../../../../validation/auth";

const LoginForm = () => {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data).unwrap();
      toast.success("Login successful!");
      navigate("/");
    } catch (error: any) {
      toast.error(error?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="login-form">
      <div className="login-form__header">
        <h2 className="login-form__title">Welcome Back</h2>
        <p className="login-form__subtitle">Sign in to your account</p>
      </div>

      <form className="login-form__form" onSubmit={handleSubmit(onSubmit)}>
        <div className="login-form__field">
          <label htmlFor="email" className="login-form__label">
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            className={`login-form__input ${errors.email ? "has-error" : ""}`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <span className="login-form__error">{errors.email.message}</span>
          )}
        </div>

        <div className="login-form__field">
          <label htmlFor="password" className="login-form__label">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            id="password"
            className={`login-form__input ${
              errors.password ? "has-error" : ""
            }`}
            placeholder="••••••••"
          />
          {errors.password && (
            <span className="login-form__error">{errors.password.message}</span>
          )}
        </div>

        <button
          type="submit"
          className="login-form__submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="login-form__footer">
        Don't have an account? <Link to="/register">Sign up</Link>
      </div>
    </div>
  );
};

export default LoginForm;
