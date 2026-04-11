import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

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
    <button
      onClick={() => navigate("/outa-chat")}
      className="w-full relative overflow-hidden rounded-2xl p-5 text-left active:scale-[0.99] transition-transform"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple/15 via-purple/8 to-purple/3 border border-purple/15 rounded-2xl" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-purple" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-foreground">{copy.title}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">{copy.sub}</p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-purple flex-shrink-0" />
      </div>
    </button>
  );
};

export default OutaBanner;
