import { useNavigate } from "react-router-dom";

const cuisineCategories = [
  { id: "afro-caribbean", label: "Afro-Caribbean", emoji: "🌶️" },
  { id: "italian", label: "Italian", emoji: "🍝" },
  { id: "japanese", label: "Japanese", emoji: "🍣" },
  { id: "thai", label: "Thai", emoji: "🍜" },
  { id: "chinese", label: "Chinese", emoji: "🥡" },
  { id: "indian", label: "Indian", emoji: "🍛" },
  { id: "american", label: "American", emoji: "🍔" },
  { id: "mediterranean", label: "Mediterranean", emoji: "🫒" },
];

const ExploreDishesRow = () => {
  const navigate = useNavigate();

  return (
    <section>
      <h2 className="text-[13px] font-semibold text-muted-foreground tracking-tight mb-2.5">
        Explore cuisines
      </h2>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 scrollbar-hide">
        {cuisineCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/discover?cuisine=${cat.id}`)}
            className="flex-shrink-0 flex items-center gap-1.5 bg-card border border-border/40 rounded-full px-3 py-1.5 text-[12px] font-medium text-foreground hover:border-purple/20 active:scale-95 transition-all"
          >
            <span className="text-sm">{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default ExploreDishesRow;
