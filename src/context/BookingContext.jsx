import  { createContext, useState } from 'react';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookingResult, setBookingResult] = useState(null);

  return (
    <BookingContext.Provider value={{ bookingResult, setBookingResult }}>
      {children}
    </BookingContext.Provider>
  );
};