import { SpaceWithSensors, IDEAL_RANGES, calculateSensorScore } from '../services/sensorSimulator';

interface SpaceCardProps {
  space: SpaceWithSensors;
}

export function SpaceCard({ space }: SpaceCardProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // Yeşil
    if (score >= 60) return '#f59e0b'; // Turuncu
    return '#ef4444'; // Kırmızı
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Mükemmel';
    if (score >= 60) return 'İyi';
    if (score >= 40) return 'Orta';
    return 'Zayıf';
  };

  const getSensorStatus = (value: number, type: keyof typeof IDEAL_RANGES): string => {
    const score = calculateSensorScore(value, IDEAL_RANGES[type]);
    if (score >= 80) return '✓';
    if (score >= 60) return '!';
    return '✗';
  };

  const getSensorStatusColor = (value: number, type: keyof typeof IDEAL_RANGES): string => {
    const score = calculateSensorScore(value, IDEAL_RANGES[type]);
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const { currentData } = space;

  return (
    <div className="space-card">
      <div className="space-header">
        <div>
          <h3>{space.name}</h3>
          <p className="space-description">{space.description}</p>
        </div>
        <div className="score-badge" style={{ backgroundColor: getScoreColor(space.suitabilityScore) }}>
          <div className="score-value">{space.suitabilityScore}</div>
          <div className="score-label">{getScoreLabel(space.suitabilityScore)}</div>
        </div>
      </div>

      <div className="sensor-grid">
        <div className="sensor-item">
          <span 
            className="sensor-status"
            style={{ color: getSensorStatusColor(currentData.temperature, 'temperature') }}
          >
            {getSensorStatus(currentData.temperature, 'temperature')}
          </span>
          <div className="sensor-info">
            <div className="sensor-label">Sıcaklık</div>
            <div className="sensor-value">{currentData.temperature}°C</div>
          </div>
        </div>

        <div className="sensor-item">
          <span 
            className="sensor-status"
            style={{ color: getSensorStatusColor(currentData.humidity, 'humidity') }}
          >
            {getSensorStatus(currentData.humidity, 'humidity')}
          </span>
          <div className="sensor-info">
            <div className="sensor-label">Nem</div>
            <div className="sensor-value">{currentData.humidity}%</div>
          </div>
        </div>

        <div className="sensor-item">
          <span 
            className="sensor-status"
            style={{ color: getSensorStatusColor(currentData.co2, 'co2') }}
          >
            {getSensorStatus(currentData.co2, 'co2')}
          </span>
          <div className="sensor-info">
            <div className="sensor-label">CO₂</div>
            <div className="sensor-value">{currentData.co2} ppm</div>
          </div>
        </div>

        <div className="sensor-item">
          <span 
            className="sensor-status"
            style={{ color: getSensorStatusColor(currentData.noise, 'noise') }}
          >
            {getSensorStatus(currentData.noise, 'noise')}
          </span>
          <div className="sensor-info">
            <div className="sensor-label">Gürültü</div>
            <div className="sensor-value">{currentData.noise} dB</div>
          </div>
        </div>

        <div className="sensor-item">
          <span 
            className="sensor-status"
            style={{ color: getSensorStatusColor(currentData.light, 'light') }}
          >
            {getSensorStatus(currentData.light, 'light')}
          </span>
          <div className="sensor-info">
            <div className="sensor-label">Aydınlatma</div>
            <div className="sensor-value">{currentData.light} lux</div>
          </div>
        </div>
      </div>
    </div>
  );
}
