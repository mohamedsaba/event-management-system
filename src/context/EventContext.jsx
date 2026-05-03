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
  const [returnPath, setReturnPath] = useState(() => {
    return localStorage.getItem("return_path") || null;
  });

  useEffect(() => {
    if (selectedEvent) localStorage.setItem("selected_event", JSON.stringify(selectedEvent));
    else localStorage.removeItem("selected_event");
  }, [selectedEvent]);

  useEffect(() => {
    if (registrationData) localStorage.setItem("registration_data", JSON.stringify(registrationData));
    else localStorage.removeItem("registration_data");
  }, [registrationData]);

  useEffect(() => {
    if (returnPath) localStorage.setItem("return_path", returnPath);
    else localStorage.removeItem("return_path");
  }, [returnPath]);

  const clearRegistration = () => {
    setSelectedEvent(null);
    setRegistrationData(null);
    setReturnPath(null);
    localStorage.removeItem("selected_event");
    localStorage.removeItem("registration_data");
    localStorage.removeItem("return_path");
  };

  return (
    <EventContext.Provider
      value={{
        selectedEvent,
        setSelectedEvent,
        registrationData,
        setRegistrationData,
        returnPath,
        setReturnPath,
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