import { useState, useEffect, useMemo } from "react";
import EventList from "../components/Event/EventList";
import SidebarFilters from "../components/Event/SidebarFilters";
import SortBar from "../components/SortBar";
import Pagination from "../components/Event/Pagination";
import SearchBar from "../components/Event/SearchBar";
import { eventsApi } from "@/utils/api/eventsApi";

function EventsPage() {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date");
  const [priceFilter, setPriceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const ITEMS_PER_PAGE = 8;

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventsApi.getEvents();
      // Only show SCHEDULED events to attendees
      const activeEvents = response.filter(e => e.eventStatus === 'SCHEDULED');
      setAllEvents(activeEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredAndSortedEvents = useMemo(() => {
    let result = [...allEvents];

    // Search
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(query) || 
        e.description?.toLowerCase().includes(query) ||
        e.location?.toLowerCase().includes(query)
      );
    }

    // Price Filter
    if (priceFilter === "free") {
      result = result.filter(e => !e.paymentRequired);
    } else if (priceFilter === "paid") {
      result = result.filter(e => e.paymentRequired);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.date) - new Date(b.date);
      }
      if (sortBy === "price") {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [allEvents, search, priceFilter, sortBy]);

  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedEvents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedEvents, page]);

  const totalPages = Math.ceil(filteredAndSortedEvents.length / ITEMS_PER_PAGE);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    setPage(1);
  };

  const handlePriceChange = (val) => {
    setPriceFilter(val);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8 text-slate-900">
          Explore Events
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-10">
          <SidebarFilters
            priceFilter={priceFilter}
            setPriceFilter={handlePriceChange}
          />

          <div className="space-y-6">
            <SearchBar search={search} setSearch={handleSearchChange} />
            <SortBar sortBy={sortBy} setSortBy={handleSortChange} />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground animate-pulse">Loading events...</p>
              </div>
            ) : paginatedEvents.length > 0 ? (
              <EventList events={paginatedEvents} />
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                <p className="text-slate-500">No events found matching your criteria.</p>
              </div>
            )}

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventsPage;