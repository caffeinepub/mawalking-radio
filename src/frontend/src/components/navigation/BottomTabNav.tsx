import { Home, Radio, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TabView = 'home' | 'browse' | 'settings';

interface BottomTabNavProps {
  currentTab: TabView;
  onTabChange: (tab: TabView) => void;
}

export default function BottomTabNav({ currentTab, onTabChange }: BottomTabNavProps) {
  const tabs = [
    { id: 'home' as TabView, label: 'Home', icon: Home },
    { id: 'browse' as TabView, label: 'Shows', icon: Radio },
    { id: 'settings' as TabView, label: 'Settings', icon: Settings },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-md border-t border-white/10"
      style={{
        paddingBottom: 'var(--safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around h-14">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          const isHome = tab.id === 'home';
          
          return (
            <Button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              variant="ghost"
              className={`flex-1 h-full rounded-none flex flex-col items-center justify-center gap-1 touch-manipulation ${
                isActive 
                  ? 'text-accent' 
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className={`text-xs ${isHome ? 'text-white font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
