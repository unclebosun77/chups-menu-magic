import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import FloatingAIButton from "./FloatingAIButton";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isChatPage = location.pathname === '/outa-chat';

  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="max-w-lg mx-auto">
        {children}
      </main>
      {!isChatPage && <FloatingAIButton />}
      <BottomNav />
    </div>
  );
};

export default Layout;
