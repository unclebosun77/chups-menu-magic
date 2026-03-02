import { useNavigate } from "react-router-dom";
import { personalizedRestaurants } from "@/data/personalizedRestaurants";
import { Star, MapPin } from "lucide-react";

const AlternativesRow = () => {
  const navigate = useNavigate();
  // Show the 2nd and 3rd picks as small alternatives
  const alternatives = personalizedRestaurants.slice(1, 3);

  if (alternatives.length === 0) return null;

  return (
    <div>
      <p className="text-[11px] text-muted-foreground/50 mb-2.5 font-medium">Not feeling it? Try these instead</p>
      <div className="flex gap-3">
        {alternatives.map((r) => (
          <button
            key={r.id}
            onClick={() => navigate(`/restaurant/${r.id}`)}
            className="flex-1 flex items-center gap-3 bg-card rounded-2xl border border-border/40 p-3 text-left hover:border-purple/20 transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-border/30">
              <img src={r.logoUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">{r.name}</p>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground/60">
                <span className="flex items-center gap-0.5">
                  <Star className="h-2.5 w-2.5 fill-purple/70 text-purple/70" />
                  {r.rating}
                </span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5" />
                  {r.distance}
                </span>
                <span>·</span>
                <span>{r.priceLevel}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AlternativesRow;
