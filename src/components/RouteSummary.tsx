import type { CSSProperties } from 'react';
import type { RouteResponse, Pack, Options } from '../types';
import brandLogo from '../assets/logo-trek-reset.png';
import { LEG_COLORS } from '../lib/colors';
import './RouteSummary.css';

const PACK_LABELS: Record<Pack, string> = {
  sherpa: '🥾 Sherpa',
  nomade: '🧭 Nomade',
  explorer: '🔭 Explorer',
};

const PACK_KM: Record<Pack, number> = {
  sherpa: 10,
  nomade: 15,
  explorer: 20,
};

interface Props {
  route: RouteResponse;
  nights: number;
  pack: Pack;
  options: Options;
  onBack: () => void;
  onRegenerate: () => void;
  loading: boolean;
}

function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function RouteSummary({ route, nights, pack, options, onBack, onRegenerate, loading }: Props) {
  const activeOptions = [
    options.repasLyophilise && '🥘 Repas lyophilisés',
    options.kitBivouac && '⛺ Kit bivouac',
    options.panierTerroir && '🧺 Panier terroir',
  ].filter(Boolean) as string[];

  return (
    <div className="result-summary">
      {/* Sticky header */}
      <div className="result-header">
        <button className="back-btn" onClick={onBack}>← Reconfigurer</button>
        <img src={brandLogo} alt="Trek and Reset" className="brand-small-logo" />
      </div>

      {/* Config recap badges */}
      <div className="config-recap">
        <span className="recap-badge recap-badge--pack">
          {PACK_LABELS[pack]} · {PACK_KM[pack]} km/j
        </span>
        <span className="recap-badge">
          {nights} nuit{nights > 1 ? 's' : ''}
        </span>
        {activeOptions.map((o) => (
          <span key={o} className="recap-badge recap-badge--option">{o}</span>
        ))}
      </div>

      {/* Total stats */}
      <div className="result-totals">
        <div className="total-item">
          <span className="total-value">{route.total_distance_km.toFixed(1)} km</span>
          <span className="total-label">distance totale</span>
        </div>
        <div className="total-divider" />
        <div className="total-item">
          <span className="total-value">{formatDuration(route.total_duration_hours)}</span>
          <span className="total-label">temps estimé</span>
        </div>
      </div>

      {/* Per-day leg cards */}
      <div className="legs-list">
        {route.legs.map((leg, i) => {
          const isLastLeg = i === route.legs.length - 1;
          const legColor = LEG_COLORS[i % LEG_COLORS.length];
          return (
            <div
              className="leg-card"
              key={i}
              style={{ '--leg-color': legColor } as CSSProperties}
            >
              <div className="leg-day-badge">
                <span className="leg-color-dot" aria-hidden="true" />
                Jour {i + 1}
              </div>
              <div className="leg-route">
                <span className="leg-place">{leg.from_name}</span>
                <span className="leg-arrow">→</span>
                <span className="leg-place">{leg.to_name}</span>
              </div>
              <div className="leg-stats">
                <span>{leg.distance_km.toFixed(1)} km</span>
                <span className="leg-dot">·</span>
                <span>{formatDuration(leg.duration_hours)}</span>
              </div>
              {isLastLeg ? (
                <div className="leg-sleep leg-sleep--return">
                  🏠 Retour à {leg.to_name}
                </div>
              ) : (
                <div className="leg-sleep">
                  🏕️ Nuit à <strong>{leg.to_name}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky action bar */}
      <div className="result-actions">
        <button className="regen-btn" onClick={onRegenerate} disabled={loading}>
          {loading ? 'Génération…' : '↺ Nouvel itinéraire'}
        </button>
      </div>
    </div>
  );
}

