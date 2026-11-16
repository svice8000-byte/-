import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed top-16 left-4 right-4 sm:left-auto sm:right-6 z-40 flex items-center gap-2.5 rounded-xl bg-[#0C4A3E] text-[#F5F2EB] border border-[#D4AF37]/40 px-4 py-2.5 text-xs font-medium shadow-lg"
    >
      <WifiOff className="w-4 h-4 text-[#D4AF37] shrink-0" />
      <span>وضع عدم الاتصال — نص المصحف والتلاوات المحفوظة متاحة محليًا</span>
    </div>
  );
};
