import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const HeroSection = () => {
  const heroImages = [
    "https://i.pinimg.com/736x/47/48/69/47486941e0c432321ea89aa3efa9deeb.jpg",
    "https://i.pinimg.com/736x/77/18/38/771838216ffe7472396962be8145cab3.jpg",
    "https://i.pinimg.com/736x/5e/18/33/5e18337670c1e3a19e0aea0a6f0e7451.jpg",
  ]; // Replace with actual image URLs

  return (
    <Swiper
      modules={[Autoplay, Navigation, Pagination]}
      autoplay={{ delay: 7000, disableOnInteraction: false }}
      navigation
      pagination={{ clickable: true }}
      loop={true}
      style={{ width: "100%", height: "400px" }}
    >
      {heroImages.map((image, index) => (
        <SwiperSlide key={index}>
          <img
            src={image}
            alt={`Slide ${index + 1}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroSection;
