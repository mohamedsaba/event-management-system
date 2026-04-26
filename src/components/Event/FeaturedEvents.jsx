import { useState, useEffect } from "react";
import { eventsApi } from "@/utils/api/eventsApi";
import EventList from "./EventList";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

function FeaturedEvents() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await eventsApi.getEvents();
        const data = Array.isArray(response) ? response : (response.data || []);
        
        // Filter for SCHEDULED and take top 3
        const active = data
          .filter(e => e.eventStatus === 'SCHEDULED')
          .slice(0, 3);
          
        setFeatured(active);
      } catch (error) {
        console.error("Failed to fetch featured events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
               <Sparkles className="w-3 h-3" />
               Curated Selection
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              Featured Tech Events
            </h2>
            <p className="text-slate-500 text-lg font-medium">
              Discover high-impact conferences, deep-dive workshops, and networking sessions popular in our community.
            </p>
          </div>
          
          <Button variant="ghost" asChild className="hidden md:flex font-bold text-primary hover:bg-primary/5 hover:text-primary">
            <Link to="/events" className="flex items-center gap-2">
               View all events <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Scanning upcoming events...</p>
          </div>
        ) : featured.length > 0 ? (
          <EventList events={featured} />
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
             <p className="text-slate-500 font-medium">No featured events at the moment.</p>
          </div>
        )}

        <div className="md:hidden flex justify-center">
           <Button variant="outline" asChild className="w-full font-bold h-12">
              <Link to="/events">View all events</Link>
           </Button>
        </div>
      </div>
    </section>
  );
}

export default FeaturedEvents;