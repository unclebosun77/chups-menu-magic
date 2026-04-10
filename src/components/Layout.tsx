import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import FloatingAIButton from "./FloatingAIButton";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const hideFloatingButton =
    ['/outa-chat', '/order-summary', '/order-success', '/auth'].some(path =>
      location.pathname.startsWith(path)
    ) ||
    location.pathname.startsWith('/restaurant/onboarding') ||
    location.pathname.startsWith('/restaurant/dashboard');

  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="max-w-lg mx-auto">
        {children}
      </main>
      {!hideFloatingButton && <FloatingAIButton />}
      <BottomNav />
    </div>
  );
};

export default Layout;
