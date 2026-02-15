import "./loader.scss";

interface LoaderProps {
  fullscreen?: boolean;
  text?: string;
}

const Loader = ({ fullscreen = false, text }: LoaderProps) => {
  return (
    <div
      className={`loader ${
        fullscreen ? "loader--fullscreen" : "loader--inline"
      }`}
    >
      <div className="loader__spinner"></div>
      {text && <p className="loader__text">{text}</p>}
    </div>
  );
};

export default Loader;
