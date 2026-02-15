import "./aboutUs.scss";

const AboutUs = () => {
  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      title: "Best Price Guarantee",
      description:
        "We guarantee the best rates for your bookings. Find a lower price and we'll match it.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
      ),
      title: "Secure Booking",
      description:
        "Your data is protected with industry-standard encryption and security measures.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
        </svg>
      ),
      title: "24/7 Support",
      description:
        "Our dedicated support team is available round the clock to assist you.",
    },
  ];

  return (
    <section className="about-us">
      <div className="about-us__container">
        <div className="about-us__content">
          <div className="about-us__text">
            <h2 className="about-us__title">Why Choose LuxeStay?</h2>
            <p className="about-us__description">
              We're committed to providing you with the finest hotel booking
              experience. With our extensive network of luxury properties and
              dedicated service, your perfect stay is just a click away.
            </p>

            <div className="about-us__features">
              {features.map((feature, index) => (
                <div key={index} className="about-us__feature">
                  <div className="about-us__feature-icon">{feature.icon}</div>
                  <div className="about-us__feature-content">
                    <h3 className="about-us__feature-title">{feature.title}</h3>
                    <p className="about-us__feature-description">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="about-us__image-grid">
            <div className="about-us__image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
                alt="Luxury hotel lobby"
                className="about-us__image"
              />
            </div>
            <div className="about-us__image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400"
                alt="Hotel room"
                className="about-us__image"
              />
            </div>
            <div className="about-us__image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400"
                alt="Hotel amenities"
                className="about-us__image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
