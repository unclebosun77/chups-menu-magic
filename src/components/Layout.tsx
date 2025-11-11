import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import FloatingAIButton from "./FloatingAIButton";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="max-w-lg mx-auto">
        {children}
      </main>
      <FloatingAIButton />
      <BottomNav />
    </div>
  );
};

export default Layout;
