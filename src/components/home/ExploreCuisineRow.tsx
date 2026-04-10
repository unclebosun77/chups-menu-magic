import { useNavigate } from "react-router-dom";

const cuisines = [
  { id: "italian", label: "Italian", emoji: "🍝" },
  { id: "afro-caribbean", label: "Afro-Caribbean", emoji: "🌍" },
  { id: "thai", label: "Thai", emoji: "🍜" },
  { id: "japanese", label: "Japanese", emoji: "🍣" },
  { id: "pizza", label: "Pizza", emoji: "🍕" },
  { id: "indian", label: "Indian", emoji: "🥘" },
];

const ExploreCuisineRow = () => {
  const navigate = useNavigate();

  return (
    <section>
      <h2 className="text-[13px] font-semibold text-muted-foreground tracking-tight mb-3">
        Explore by cuisine 🍴
      </h2>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {cuisines.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/discover?cuisine=${c.id}`)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 rounded-full bg-secondary/60 border border-border/40 flex items-center justify-center text-2xl hover:border-purple/25 transition-colors">
              {c.emoji}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{c.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default ExploreCuisineRow;
