import { ReactNode, useState, useEffect } from "react";
import BottomNav from "./BottomNav";
import RestaurantBottomNav from "./RestaurantBottomNav";
import { WifiOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { userRole } = useAuth();

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16">
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-center py-2 px-4 text-xs font-medium flex items-center justify-center gap-2 animate-slide-down">
          <WifiOff className="h-3.5 w-3.5" />
          You're offline — some features may be limited
        </div>
      )}
      <main className="max-w-lg mx-auto">
        {children}
      </main>
      {userRole === 'restaurant' ? <RestaurantBottomNav /> : <BottomNav />}
    </div>
  );
};

export default Layout;
