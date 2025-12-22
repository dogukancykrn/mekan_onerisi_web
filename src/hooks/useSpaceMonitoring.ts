import { useState, useEffect } from 'react';
import {
  SensorSimulator,
  SensorData,
  SpaceInfo,
  SpaceWithSensors,
  calculateOverallScore
} from '../services/sensorSimulator';

// Örnek mekânlar
const SAMPLE_SPACES: SpaceInfo[] = [
  {
    id: '1',
    name: 'Şirket Ofisi - Açık Alan',
    type: 'office',
    description: 'Modern ofis ortamı, açık çalışma alanı'
  },
  {
    id: '2',
    name: 'Beyoğlu Kafe',
    type: 'cafe',
    description: 'Merkezi lokasyon, orta gürültü seviyesi'
  },
  {
    id: '3',
    name: 'CoWork Space İstanbul',
    type: 'coworking',
    description: 'Ortak çalışma alanı, sessiz odalar mevcut'
  },
  {
    id: '4',
    name: 'Ev Ofisi',
    type: 'home',
    description: 'Kişisel çalışma alanı, sessiz ortam'
  }
];

const MAX_HISTORY_LENGTH = 30; // Son 30 veri noktası

/**
 * Mekân verilerini yöneten ve gerçek zamanlı güncelleyen hook
 */
export function useSpaceMonitoring() {
  const [spaces, setSpaces] = useState<SpaceWithSensors[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Her mekân için simülatör oluştur
    const simulators = SAMPLE_SPACES.map(space => ({
      space,
      simulator: new SensorSimulator(space.type)
    }));

    // İlk verileri oluştur
    const initialSpaces: SpaceWithSensors[] = simulators.map(({ space, simulator }) => {
      const initialData = simulator.generateData();
      return {
        ...space,
        currentData: initialData,
        history: [initialData],
        suitabilityScore: calculateOverallScore(initialData)
      };
    });

    setSpaces(initialSpaces);
    setIsMonitoring(true);

    // Her mekân için veri akışını başlat
    const stopFunctions = simulators.map(({ simulator }, index) => 
      simulator.startStream((newData: SensorData) => {
        setSpaces(prevSpaces => {
          const updatedSpaces = [...prevSpaces];
          const spaceToUpdate = updatedSpaces[index];
          
          if (spaceToUpdate) {
            // Yeni veriyi ekle
            const newHistory = [...spaceToUpdate.history, newData];
            
            // Maksimum geçmiş uzunluğunu koru
            if (newHistory.length > MAX_HISTORY_LENGTH) {
              newHistory.shift();
            }

            updatedSpaces[index] = {
              ...spaceToUpdate,
              currentData: newData,
              history: newHistory,
              suitabilityScore: calculateOverallScore(newData)
            };
          }
          
          return updatedSpaces;
        });
      }, 3000) // Her 3 saniyede bir güncelle
    );

    // Cleanup: tüm stream'leri durdur
    return () => {
      stopFunctions.forEach(stop => stop());
      setIsMonitoring(false);
    };
  }, []);

  return { spaces, isMonitoring };
}
