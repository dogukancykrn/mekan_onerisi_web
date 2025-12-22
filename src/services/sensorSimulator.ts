// Sensör tipleri ve veri yapıları
export interface SensorData {
  timestamp: number;
  temperature: number;    // Sıcaklık (°C)
  humidity: number;       // Nem (%)
  co2: number;           // CO2 seviyesi (ppm)
  noise: number;         // Gürültü (dB)
  light: number;         // Aydınlatma (lux)
}

export interface SpaceInfo {
  id: string;
  name: string;
  type: 'office' | 'cafe' | 'coworking' | 'home';
  description: string;
}

export interface SpaceWithSensors extends SpaceInfo {
  currentData: SensorData;
  history: SensorData[];
  suitabilityScore: number;
}

// İdeal değer aralıkları
export const IDEAL_RANGES = {
  temperature: { min: 20, max: 24, optimal: 22 },
  humidity: { min: 40, max: 60, optimal: 50 },
  co2: { min: 400, max: 800, optimal: 600 },
  noise: { min: 30, max: 50, optimal: 40 },
  light: { min: 300, max: 500, optimal: 400 }
};

// Mekân tipine göre temel değerler
const BASE_VALUES = {
  office: {
    temperature: 22,
    humidity: 45,
    co2: 650,
    noise: 45,
    light: 400
  },
  cafe: {
    temperature: 23,
    humidity: 55,
    co2: 800,
    noise: 65,
    light: 350
  },
  coworking: {
    temperature: 21,
    humidity: 48,
    co2: 700,
    noise: 50,
    light: 450
  },
  home: {
    temperature: 22,
    humidity: 50,
    co2: 550,
    noise: 35,
    light: 380
  }
};

/**
 * Gerçekçi sensör verisi üreten sınıf
 * Gün içi değişimleri ve rastgele dalgalanmaları simüle eder
 */
export class SensorSimulator {
  private baseValues: typeof BASE_VALUES.office;

  constructor(spaceType: SpaceInfo['type']) {
    this.baseValues = BASE_VALUES[spaceType];
  }

  /**
   * Günün saatine göre değişim faktörü
   */
  private getTimeOfDayFactor(): number {
    const hour = new Date().getHours();
    
    // Sabah 6-9: Yavaş artış
    if (hour >= 6 && hour < 9) {
      return 0.7 + (hour - 6) * 0.1;
    }
    // Gündüz 9-17: Yoğun
    if (hour >= 9 && hour < 17) {
      return 1.0 + Math.sin((hour - 9) / 8 * Math.PI) * 0.2;
    }
    // Akşam 17-22: Azalış
    if (hour >= 17 && hour < 22) {
      return 1.0 - (hour - 17) * 0.1;
    }
    // Gece: Düşük
    return 0.5;
  }

  /**
   * Rastgele dalgalanma ekler
   */
  private addNoise(value: number, variance: number): number {
    const noise = (Math.random() - 0.5) * 2 * variance;
    return value + noise;
  }

  /**
   * Yeni sensör verisi üretir
   */
  generateData(): SensorData {
    const timeFactor = this.getTimeOfDayFactor();
    
    // Sıcaklık: ±2°C dalgalanma
    const temperature = this.addNoise(
      this.baseValues.temperature * (0.95 + timeFactor * 0.05),
      2
    );

    // Nem: ±5% dalgalanma
    const humidity = this.addNoise(
      this.baseValues.humidity * (0.9 + timeFactor * 0.1),
      5
    );

    // CO2: Yoğunluğa bağlı artış, ±100ppm dalgalanma
    const co2 = this.addNoise(
      this.baseValues.co2 * timeFactor,
      100
    );

    // Gürültü: Yoğunluğa bağlı artış, ±8dB dalgalanma
    const noise = this.addNoise(
      this.baseValues.noise * timeFactor,
      8
    );

    // Aydınlatma: Gün ışığına bağlı, ±50lux dalgalanma
    const light = this.addNoise(
      this.baseValues.light * (0.8 + timeFactor * 0.2),
      50
    );

    return {
      timestamp: Date.now(),
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity),
      co2: Math.round(co2),
      noise: Math.round(noise),
      light: Math.round(light)
    };
  }

  /**
   * Periyodik veri akışı başlatır
   */
  startStream(callback: (data: SensorData) => void, intervalMs: number = 2000): () => void {
    const interval = setInterval(() => {
      callback(this.generateData());
    }, intervalMs);

    // İlk veriyi hemen gönder
    callback(this.generateData());

    // Stream'i durdurmak için fonksiyon döndür
    return () => clearInterval(interval);
  }
}

/**
 * Bir sensör değerinin uygunluk skorunu hesaplar (0-100)
 */
export function calculateSensorScore(
  value: number,
  range: { min: number; max: number; optimal: number }
): number {
  if (value === range.optimal) return 100;
  
  if (value < range.min) {
    const distance = range.min - value;
    const maxDistance = range.min * 0.5; // %50 altına düşerse skor 0
    return Math.max(0, 100 - (distance / maxDistance) * 100);
  }
  
  if (value > range.max) {
    const distance = value - range.max;
    const maxDistance = range.max * 0.5; // %50 üstüne çıkarsa skor 0
    return Math.max(0, 100 - (distance / maxDistance) * 100);
  }
  
  // İdeal aralıkta: optimal noktaya yakınlığa göre skor
  const distanceFromOptimal = Math.abs(value - range.optimal);
  const maxDistanceInRange = Math.max(
    range.optimal - range.min,
    range.max - range.optimal
  );
  
  return 100 - (distanceFromOptimal / maxDistanceInRange) * 20; // Max %20 azalma
}

/**
 * Genel uygunluk skorunu hesaplar
 */
export function calculateOverallScore(data: SensorData): number {
  const scores = {
    temperature: calculateSensorScore(data.temperature, IDEAL_RANGES.temperature),
    humidity: calculateSensorScore(data.humidity, IDEAL_RANGES.humidity),
    co2: calculateSensorScore(data.co2, IDEAL_RANGES.co2),
    noise: calculateSensorScore(data.noise, IDEAL_RANGES.noise),
    light: calculateSensorScore(data.light, IDEAL_RANGES.light)
  };

  // Ağırlıklı ortalama (CO2 ve gürültü daha önemli)
  const weightedScore = 
    scores.temperature * 0.2 +
    scores.humidity * 0.15 +
    scores.co2 * 0.25 +
    scores.noise * 0.25 +
    scores.light * 0.15;

  return Math.round(weightedScore);
}
