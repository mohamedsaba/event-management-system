// import { createContext, useState } from "react";

// export const EventContext = createContext();

// export const EventProvider = ({ children }) => {
//   const [selectedEvent, setSelectedEvent] = useState({
//     title: "Tech Summit 2025",
//     tickets: 1,
//     pricePerTicket: 250,
//   });

//   return (
//     <EventContext.Provider value={{ selectedEvent, setSelectedEvent }}>
//       {children}
//     </EventContext.Provider>
//   );
// };

import { createContext, useContext, useState } from "react";

const EventContext = createContext();

export function EventProvider({ children }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);

  const clearRegistration = () => {
    setSelectedEvent(null);
    setRegistrationData(null);
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