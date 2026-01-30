import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, BookOpen, Music, MessageCircle, User } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Calendar, label: 'Mood', path: '/mood' },
    { icon: BookOpen, label: 'Journal', path: '/journal' },
    { icon: Music, label: 'Music', path: '/music' },
    { icon: MessageCircle, label: 'Chat', path: '/chat' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  // Don't show on auth/onboarding screens
  if (location.pathname === '/' || location.pathname === '/onboarding' || location.pathname === '/auth') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 px-2 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-calm text-primary-foreground shadow-soft scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;