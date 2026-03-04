import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center select-none cursor-pointer"
      style={{ backgroundColor: "#F1F1EC" }}
      onClick={() => navigate("/order-type")}
    >
      {/* Brand */}
      <h1
        className="text-8xl mb-4"
        style={{ fontFamily: "'Pacifico', cursive", color: "#1C1C1C" }}
      >
        Delicious
      </h1>

      <p className="text-2xl font-semibold text-gray-400 mb-16">
        Self-Service Ordering
      </p>

      {/* CTA */}
      <button
        className="text-2xl font-bold px-16 py-5 rounded-full text-black transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
        style={{ backgroundColor: "#B5E533" }}
      >
        Touch to proceed
      </button>

      <p className="mt-6 text-gray-400 text-base">Tap anywhere to get started</p>
    </div>
  );
}
