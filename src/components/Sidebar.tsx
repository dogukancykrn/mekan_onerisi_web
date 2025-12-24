export function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <h3>Menü</h3>
      </div>

      <nav className="sidebar-nav">
        <a href="/" className="sidebar-link">Dashboard</a>
        <a href="#campaigns" className="sidebar-link">Kampanyalar</a>
        <a href="#info" className="sidebar-link">Bilgi</a>
      </nav>

      <div className="sidebar-footer">
        <small>© Mekân Takip</small>
      </div>
    </aside>
  );
}
