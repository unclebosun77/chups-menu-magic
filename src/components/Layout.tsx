import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import FloatingAIButton from "./FloatingAIButton";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-premium-dark pb-16 relative overflow-hidden">
      {/* Premium background with animated mesh gradient */}
      <div className="absolute inset-0 bg-premium-mesh opacity-30" />
      <div className="absolute inset-0 bg-gradient-premium-radial opacity-40" />
      
      <main className="max-w-lg mx-auto relative z-10">
        {children}
      </main>
      <FloatingAIButton />
      <BottomNav />
    </div>
  );
};

export default Layout;
