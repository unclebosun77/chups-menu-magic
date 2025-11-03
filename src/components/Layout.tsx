import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import FloatingAIButton from "./FloatingAIButton";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const showFloatingButton = location.pathname !== "/ai-assistant";

  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="max-w-lg mx-auto">
        {children}
      </main>
      {showFloatingButton && <FloatingAIButton />}
      <BottomNav />
    </div>
  );
};

export default Layout;
