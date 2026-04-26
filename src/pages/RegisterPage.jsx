import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventContext } from "@/context/EventContext";
import { ArrowLeft, Check } from "lucide-react";
import { eventsData } from "../utils/eventsData";

function RegisterPage() {
  const navigate = useNavigate();
  const { setRegistrationData, setSelectedEvent, selectedEvent } =
    useEventContext();

  const event =
    eventsData.find((e) => e.id === selectedEvent?.id);

  const isFull =
    event?.registered >= event?.capacity;

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    tickets: 1,
  });

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setRegistrationData({
      name: formData.name,
      email: formData.email,
    });

    setSelectedEvent((prev) => ({
      ...prev,
      tickets: formData.tickets,
      pricePerTicket: prev?.price ?? prev?.pricePerTicket ?? 0,
    }));

    navigate("/payment");
  };

  if (isFull) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-fade-in-up">
        <h1 className="text-2xl font-bold text-red-500">
          Registration Closed
        </h1>

        <p className="text-slate-600 mt-2">
          This event has reached full capacity.
        </p>

        <button
          onClick={() => navigate("/events")}
          className="mt-6 bg-primary text-white px-4 py-2 rounded-lg"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const steps = ["Info", "Tickets", "Review"];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6 animate-fade-in-up">

      <button
        onClick={() => navigate("/events")}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </button>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          {steps.map((s, i) => (
            <span
              key={i}
              className={step === i + 1 ? "text-primary font-medium" : ""}
            >
              {s}
            </span>
          ))}
        </div>

        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">

        {step === 1 && (
          <div className="space-y-4">

            <h2 className="font-semibold">Your Information</h2>

            <input
              placeholder="Name"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}

            <input
              placeholder="Email"
              type="email"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (validateStep1()) handleNext();
                }}
                className="bg-primary text-white px-4 py-2 rounded-lg"
              >
                Next
              </button>
            </div>

          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">

            <h2 className="font-semibold">Tickets</h2>

            <input
              type="number"
              min="1"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={formData.tickets}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tickets: Number(e.target.value),
                })
              }
            />

            <div className="flex justify-between">
              <button onClick={handleBack} className="text-sm text-slate-600">
                Back
              </button>

              <button
                onClick={handleNext}
                className="bg-primary text-white px-4 py-2 rounded-lg"
              >
                Next
              </button>
            </div>

          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">

            <h2 className="font-semibold">Review</h2>

            <div className="text-sm space-y-2 bg-slate-50 p-4 rounded-lg border">
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Tickets:</strong> {formData.tickets}</p>
            </div>

            <div className="flex justify-between">
              <button onClick={handleBack} className="text-sm text-slate-600">
                Back
              </button>

              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirm
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default RegisterPage;