import Landing from "../components/landing/Landing";
import FeaturedHotels from "../components/featured-hotels/FeaturedHotels";
import AboutUs from "../components/about-us/AboutUs";
import "./home.scss";

const Home = () => {
  return (
    <div className="home">
      <Landing />
      <FeaturedHotels />
      <AboutUs />
    </div>
  );
};

export default Home;
