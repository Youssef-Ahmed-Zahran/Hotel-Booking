import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./landing.scss";

const Landing = () => {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.append("city", city);
    if (country) params.append("country", country);
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <section className="landing">
      {/* Video Background */}
      <video className="landing__video" autoPlay loop muted playsInline>
        <source
          src="https://media.istockphoto.com/id/1543397593/video/couple-having-fun-by-the-pool-in-tropical-resort.mp4?s=mp4-640x640-is&k=20&c=Gk-jOHqV1F5gtknF64G6665ddxEC9WgIWhz9Yn1D3VQ="
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div className="landing__overlay"></div>

      <div className="landing__content">
        <h1 className="landing__title">
          Discover Your Perfect <span>Luxury Stay</span>
        </h1>
        <p className="landing__subtitle">
          Experience world-class hospitality at the finest hotels across the
          globe. Your dream vacation starts here.
        </p>

        <div className="landing__search">
          <form className="landing__search-form" onSubmit={handleSearch}>
            <div className="landing__search-field">
              <label htmlFor="city" className="landing__search-label">
                City
              </label>
              <input
                type="text"
                id="city"
                className="landing__search-input"
                placeholder="Where are you going?"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="landing__search-field">
              <label htmlFor="country" className="landing__search-label">
                Country
              </label>
              <input
                type="text"
                id="country"
                className="landing__search-input"
                placeholder="Select country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>

            <button type="submit" className="landing__search-btn">
              Search Hotels
            </button>
          </form>
        </div>

        <div className="landing__stats">
          <div className="landing__stat">
            <div className="landing__stat-number">500+</div>
            <div className="landing__stat-label">Hotels</div>
          </div>
          <div className="landing__stat">
            <div className="landing__stat-number">50K+</div>
            <div className="landing__stat-label">Happy Guests</div>
          </div>
          <div className="landing__stat">
            <div className="landing__stat-number">100+</div>
            <div className="landing__stat-label">Destinations</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Landing;
