import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SpaceWithSensors } from '../services/sensorSimulator';

interface SensorChartProps {
  space: SpaceWithSensors;
  sensorType: 'temperature' | 'humidity' | 'co2' | 'noise' | 'light';
}

const SENSOR_CONFIG = {
  temperature: {
    label: 'Sıcaklık',
    unit: '°C',
    color: '#ef4444',
    domain: [15, 30]
  },
  humidity: {
    label: 'Nem',
    unit: '%',
    color: '#3b82f6',
    domain: [20, 80]
  },
  co2: {
    label: 'CO₂',
    unit: 'ppm',
    color: '#8b5cf6',
    domain: [300, 1200]
  },
  noise: {
    label: 'Gürültü',
    unit: 'dB',
    color: '#f59e0b',
    domain: [20, 80]
  },
  light: {
    label: 'Aydınlatma',
    unit: 'lux',
    color: '#eab308',
    domain: [200, 600]
  }
};

export function SensorChart({ space, sensorType }: SensorChartProps) {
  const config = SENSOR_CONFIG[sensorType];
  
  // Son 15 veriyi göster
  const data = space.history.slice(-15).map((item, index) => ({
    index: index + 1,
    value: item[sensorType],
    time: new Date(item.timestamp).toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }));

  return (
    <div className="sensor-chart">
      <h4>{config.label} Geçmişi - {space.name}</h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            domain={config.domain}
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#f3f4f6' }}
            formatter={(value: number) => [`${value} ${config.unit}`, config.label]}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={config.color} 
            strokeWidth={2}
            dot={{ fill: config.color, r: 3 }}
            name={`${config.label} (${config.unit})`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
