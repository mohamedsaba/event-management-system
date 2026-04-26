import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventContext } from "../context/EventContext";

function RegisterButton({ event }) {
  const navigate = useNavigate();
  const { setSelectedEvent } = useEventContext();
  const [error, setError] = useState("");

  const isFull = event.registered >= event.capacity;

  const handleClick = () => {
    if (isFull) {
      setError("Registration closed for this event");
      return;
    }

    setError("");

    setSelectedEvent({
      ...event,
      tickets: 1,
    });

    navigate("/register");
  };

  return (
    <div className="flex flex-col items-start gap-1">
      {error && (
        <p className="text-xs text-red-500 font-medium">
          {error}
        </p>
      )}

      <button
        onClick={handleClick}
        disabled={isFull}
        className={`
          text-sm font-medium px-4 py-2 rounded-lg shadow-sm cursor-pointer
          transition-all duration-300 ease-in-out
          hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg
          ${isFull
            ? "bg-slate-400 cursor-not-allowed opacity-70"
            : "bg-primary text-white hover:brightness-75"
          }
        `}
      >
        Register
      </button>
    </div>
  );
}

export default RegisterButton;