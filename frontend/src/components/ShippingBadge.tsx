import { Truck } from 'lucide-react';
import { Badge } from './Badge';

export function ShippingBadge({ method }: { method: string | null | undefined }) {
  if (!method) return null;
  return (
    <Badge variant="blue">
      <Truck size={12} />
      {method}
    </Badge>
  );
}
