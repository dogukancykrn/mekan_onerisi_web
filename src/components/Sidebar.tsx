export function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <h3>Menü</h3>
      </div>

      <nav className="sidebar-nav">
        <a href="#campaigns" className="sidebar-link">Kampanyalar</a>
      </nav>

      <div className="sidebar-footer">
        <small>© Mekân Takip</small>
      </div>
    </aside>
  );
}
