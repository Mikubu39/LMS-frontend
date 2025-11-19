import hero from "../assets/hero.jpg";

export default function Hero() {
  return (
    <section className="hero hero-image-only">
      <img className="hero-banner" src={hero} alt="Mankai Academy banner" />
      {/* Nếu thích giữ đường cong phía dưới thì để lại, không cần thì xoá */}
      <svg className="wave" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden>
        <path d="M0,32L48,42.7C96,53,192,75,288,74.7C384,75,480,53,576,37.3C672,21,768,11,864,10.7C960,11,1056,21,1152,26.7C1248,32,1344,32,1392,32L1440,32L1440,48L1392,48C1344,48,1248,48,1152,48C1056,48,960,48,864,48C768,48,672,48,576,48C480,48,384,48,288,48C192,48,96,48,48,48L0,48Z" fill="#fff"/>
      </svg>
    </section>
  );
}
