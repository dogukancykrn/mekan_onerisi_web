import { useAuth } from '../context/AuthContext';
import { useSpaceMonitoring } from '../hooks/useSpaceMonitoring';
import { SpaceCard } from '../components/SpaceCard';
import { SensorChart } from '../components/SensorChart';
import { useState, useEffect } from 'react';
import '../App.css';
import { Sidebar } from '../components/Sidebar';
import { Campaigns } from '../components/Campaigns';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { spaces, isMonitoring } = useSpaceMonitoring();
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // PWA install prompt'u yakala
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ Kullanıcı PWA yükledi');
    }
    
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const selectedSpace = spaces.find(s => s.id === selectedSpaceId);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>🏢 Mekân Uygunluk Takip Sistemi</h1>
            <p className="subtitle">
              Uzaktan çalışma için en uygun mekânı bulun
              {isMonitoring && <span className="live-indicator">● Canlı</span>}
            </p>
          </div>
          <div className="user-section">
            {showInstallButton && (
              <button 
                className="install-button" 
                onClick={handleInstallClick}
                style={{
                  marginRight: '1rem',
                  padding: '0.5rem 1rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                📱 Telefona Yükle
              </button>
            )}
            <div className="user-info">
              <span className="user-name">👤 {user?.name}</span>
              <button className="logout-button" onClick={logout}>
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Sidebar />

        <div>
          <section className="spaces-section">
            <h2>Mekânlar</h2>
            <div className="spaces-grid">
              {spaces.map(space => (
                <div key={space.id} onClick={() => setSelectedSpaceId(space.id)}>
                  <SpaceCard space={space} />
                </div>
              ))}
            </div>
          </section>

          {selectedSpace && (
            <section className="charts-section">
              <div className="charts-header">
                <h2>Detaylı Sensör Verileri</h2>
                <button 
                  className="close-button"
                  onClick={() => setSelectedSpaceId(null)}
                >
                  ✕ Kapat
                </button>
              </div>
              
              <div className="charts-grid">
                <SensorChart space={selectedSpace} sensorType="temperature" />
                <SensorChart space={selectedSpace} sensorType="humidity" />
                <SensorChart space={selectedSpace} sensorType="co2" />
                <SensorChart space={selectedSpace} sensorType="noise" />
                <SensorChart space={selectedSpace} sensorType="light" />
              </div>
            </section>
          )}



          <Campaigns />
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2025 Mekân Uygunluk Takip Sistemi | Sensör verileri simüle edilmiştir</p>
      </footer>
    </div>
  );
}
