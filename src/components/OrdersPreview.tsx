import { Order } from '@/lib/types';
import { Package } from 'lucide-react';

interface OrdersPreviewProps {
  orders: Order[];
}

export function OrdersPreview({ orders }: OrdersPreviewProps) {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="card-elevated overflow-hidden animate-fade-in">
      <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">
          Loaded Orders ({orders.length})
        </h3>
      </div>
      <div className="overflow-x-auto max-h-64">
        <table className="data-table">
          <thead className="sticky top-0 bg-card">
            <tr>
              <th>Order ID</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Order Time</th>
              <th>Due Time</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.order_id}>
                <td className="font-mono font-medium text-primary">
                  {order.order_id}
                </td>
                <td className="font-mono text-sm">{order.latitude.toFixed(4)}</td>
                <td className="font-mono text-sm">{order.longitude.toFixed(4)}</td>
                <td>{formatTime(order.order_time)}</td>
                <td>{formatTime(order.due_time)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
