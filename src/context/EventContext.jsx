import { createContext, useContext, useState, useEffect } from "react";

const EventContext = createContext();

export function EventProvider({ children }) {
  const [selectedEvent, setSelectedEvent] = useState(() => {
    const saved = localStorage.getItem("selected_event");
    return saved ? JSON.parse(saved) : null;
  });
  const [registrationData, setRegistrationData] = useState(() => {
    const saved = localStorage.getItem("registration_data");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (selectedEvent) localStorage.setItem("selected_event", JSON.stringify(selectedEvent));
    else localStorage.removeItem("selected_event");
  }, [selectedEvent]);

  useEffect(() => {
    if (registrationData) localStorage.setItem("registration_data", JSON.stringify(registrationData));
    else localStorage.removeItem("registration_data");
  }, [registrationData]);

  const clearRegistration = () => {
    setSelectedEvent(null);
    setRegistrationData(null);
    localStorage.removeItem("selected_event");
    localStorage.removeItem("registration_data");
  };

  return (
    <EventContext.Provider
      value={{
        selectedEvent,
        setSelectedEvent,
        registrationData,
        setRegistrationData,
        clearRegistration
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  return useContext(EventContext);
}