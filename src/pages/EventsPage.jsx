import { useState } from "react";
import { eventsData } from "../utils/eventsData";
import EventList from "../components/Event/EventList";
import SidebarFilters from "../components/Event/SidebarFilters";
import SortBar from "../components/SortBar";
import Pagination from "../components/Event/Pagination";
import SearchBar from "../components/Event/SearchBar";
import Navbar from "../components/Navbar";

function EventsPage() {
  const [sortBy, setSortBy] = useState("date");
  const [priceFilter, setPriceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const EVENTS_PER_PAGE = 8;

  let filteredEvents = [...eventsData];

  // Search filter
  if (search) {
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.venue.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Price filter
  if (priceFilter === "free") {
    filteredEvents = filteredEvents.filter(e => e.price === 0);
  }

  if (priceFilter === "paid") {
    filteredEvents = filteredEvents.filter(e => e.price > 0);
  }

  // Sorting
  if (sortBy === "date") {
    filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  if (sortBy === "price") {
    filteredEvents.sort((a, b) => a.price - b.price);
  }

  // Pagination
  const start = (page - 1) * EVENTS_PER_PAGE;
  const paginatedEvents = filteredEvents.slice(start, start + EVENTS_PER_PAGE);

  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in-up">

      {/* NAVBAR ADDED HERE */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-8">
          Explore Tech Events
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-10">

          {/* Sidebar */}
          <SidebarFilters
            priceFilter={priceFilter}
            setPriceFilter={setPriceFilter}
          />

          {/* Content */}
          <div className="space-y-6">

            <SearchBar search={search} setSearch={setSearch} />

            <SortBar sortBy={sortBy} setSortBy={setSortBy} />

            <EventList events={paginatedEvents} />

            <Pagination
              page={page}
              totalPages={totalPages}
              setPage={setPage}
            />

          </div>

        </div>

      </div>
    </div>
  );
}

export default EventsPage;