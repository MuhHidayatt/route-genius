import { Order } from './types';

export function parseCSV(content: string): Order[] {
  const lines = content.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file must have a header row and at least one data row');
  }

  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  
  const requiredColumns = ['order_id', 'latitude', 'longitude', 'order_time', 'due_time'];
  const missingColumns = requiredColumns.filter(col => !header.includes(col));
  
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  const columnIndices = {
    order_id: header.indexOf('order_id'),
    latitude: header.indexOf('latitude'),
    longitude: header.indexOf('longitude'),
    order_time: header.indexOf('order_time'),
    due_time: header.indexOf('due_time'),
  };

  const orders: Order[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    
    if (values.length < header.length) {
      throw new Error(`Row ${i + 1} has insufficient columns`);
    }

    const order: Order = {
      order_id: values[columnIndices.order_id].trim(),
      latitude: parseFloat(values[columnIndices.latitude]),
      longitude: parseFloat(values[columnIndices.longitude]),
      order_time: parseDateTime(values[columnIndices.order_time]),
      due_time: parseDateTime(values[columnIndices.due_time]),
    };

    if (isNaN(order.latitude) || isNaN(order.longitude)) {
      throw new Error(`Row ${i + 1}: Invalid coordinates`);
    }

    if (isNaN(order.order_time.getTime()) || isNaN(order.due_time.getTime())) {
      throw new Error(`Row ${i + 1}: Invalid date/time format`);
    }

    orders.push(order);
  }

  if (orders.length === 0) {
    throw new Error('No valid orders found in CSV');
  }

  return orders;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function parseDateTime(value: string): Date {
  const trimmed = value.trim().replace(/"/g, '');
  
  // Try ISO format
  let date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try common formats: YYYY-MM-DD HH:mm:ss, DD/MM/YYYY HH:mm
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):?(\d{2})?$/,
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):?(\d{2})?$/,
  ];

  for (const format of formats) {
    const match = trimmed.match(format);
    if (match) {
      if (format === formats[0]) {
        // YYYY-MM-DD format
        return new Date(
          parseInt(match[1]),
          parseInt(match[2]) - 1,
          parseInt(match[3]),
          parseInt(match[4]),
          parseInt(match[5]),
          parseInt(match[6] || '0')
        );
      } else {
        // DD/MM/YYYY format
        return new Date(
          parseInt(match[3]),
          parseInt(match[2]) - 1,
          parseInt(match[1]),
          parseInt(match[4]),
          parseInt(match[5]),
          parseInt(match[6] || '0')
        );
      }
    }
  }

  throw new Error(`Cannot parse date: ${value}`);
}

export function generateSampleCSV(): string {
  const baseTime = new Date();
  baseTime.setHours(9, 0, 0, 0);

  const orders = [
    { id: 'ORD001', lat: -0.0150, lng: 109.3500, dueOffset: 60 },
    { id: 'ORD002', lat: -0.0300, lng: 109.3600, dueOffset: 90 },
    { id: 'ORD003', lat: -0.0100, lng: 109.3300, dueOffset: 75 },
    { id: 'ORD004', lat: -0.0400, lng: 109.3450, dueOffset: 120 },
    { id: 'ORD005', lat: -0.0200, lng: 109.3550, dueOffset: 105 },
  ];

  const header = 'order_id,latitude,longitude,order_time,due_time';
  const rows = orders.map(o => {
    const orderTime = baseTime.toISOString().replace('T', ' ').slice(0, 19);
    const dueTime = new Date(baseTime.getTime() + o.dueOffset * 60000)
      .toISOString().replace('T', ' ').slice(0, 19);
    return `${o.id},${o.lat},${o.lng},${orderTime},${dueTime}`;
  });

  return [header, ...rows].join('\n');
}
