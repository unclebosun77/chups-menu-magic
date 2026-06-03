import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

const OutaBanner = () => {
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const isWeekend = [0, 6].includes(new Date().getDay());
  const copy = hour < 12
    ? { title: "Perfect brunch spot?", sub: "Let Outa find somewhere great ☀️" }
    : hour < 17
    ? { title: "Afternoon plans sorted", sub: "Tell Outa your vibe and budget 🌤️" }
    : { title: "Where are we going tonight?", sub: "Let Outa plan your perfect evening ✨" };
  if (isWeekend) copy.title = "Weekend sorted 🎉 — " + copy.title;

  return (
    <div className="w-full bg-foreground text-white rounded-3xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-white truncate">{copy.title}</p>
            <p className="text-[12px] text-white/60 mt-0.5 truncate">{copy.sub}</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/outa-chat")}
          className="flex-shrink-0 bg-white text-foreground rounded-full text-[13px] font-semibold px-5 h-9 active:scale-[0.97] transition-transform"
        >
          Ask Outa
        </button>
      </div>
    </div>
  );
};

export default OutaBanner;
