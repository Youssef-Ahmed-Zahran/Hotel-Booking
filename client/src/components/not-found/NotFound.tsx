import { Link } from "react-router-dom";
import "./notFound.scss";

const NotFound = () => {
  return (
    <div className="not-found">
      <svg className="not-found__icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      <h1 className="not-found__title">404</h1>
      <p className="not-found__message">
        Oops! The page you're looking for doesn't exist. It might have been
        moved or deleted.
      </p>
      <Link to="/" className="not-found__btn">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
