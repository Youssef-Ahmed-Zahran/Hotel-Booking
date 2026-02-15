import LoginForm from "../../components/login-form/LoginForm";
import "./login.scss";

const Login = () => {
  return (
    <div className="login">
      <div className="login__container">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
