import { Badge } from '@/components/ui/badge';
import { Radio } from 'lucide-react';

export default function LiveBadge() {
  return (
    <Badge className="bg-red-600 text-white border-0 px-3 py-1 flex items-center gap-1.5 shadow-lg">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
      </span>
      <Radio className="w-3 h-3" />
      <span className="text-xs font-bold">LIVE</span>
    </Badge>
  );
}
