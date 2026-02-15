import RegisterForm from "../../components/register-form/RegisterForm";
import "./register.scss";

const Register = () => {
  return (
    <div className="register">
      <div className="register__container">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
