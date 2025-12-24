import React from 'react';
import { getCampaigns } from '../services/campaigns';

export function Campaigns() {
  const campaigns = getCampaigns();

  return (
    <section id="campaigns" className="campaigns">
      <h2>📣 Kampanyalar</h2>
      <div className="campaigns-grid">
        {campaigns.map(c => (
          <article key={c.id} className="campaign-card">
            <div className="campaign-header">
              <h3>{c.company}</h3>
              <span className="campaign-badge">{c.discount}</span>
            </div>
            <p className="campaign-desc">{c.description}</p>
            <a href={c.url} target="_blank" rel="noreferrer" className="campaign-cta">Detay</a>
          </article>
        ))}
      </div>
    </section>
  );
}
