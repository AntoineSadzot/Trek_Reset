import { useEffect, useRef, useState } from 'react';
import { MapView } from './components/MapView';
import { RouteForm } from './components/RouteForm';
import { RouteSummary } from './components/RouteSummary';
import { fetchBivouacs, generateRoute } from './api';
import type { Bivouac, RouteResponse, Pack, Options } from './types';
import brandLogo from './assets/logo-trek-reset.png';
import './App.css';

type AppMode = 'config' | 'reveal' | 'result';
const RESULT_OVERLAY_FADE_MS = 2000;

interface Config {
  nights: number;
  distancePerDay: number;
  pack: Pack;
  options: Options;
}

export default function App() {
  const [bivouacs, setBivouacs] = useState<Bivouac[]>([]);
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [mode, setMode] = useState<AppMode>('config');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [mobileResultPanelOpen, setMobileResultPanelOpen] = useState(false);
  const [showResultRevealOverlay, setShowResultRevealOverlay] = useState(false);
  const [resultRevealOverlayFading, setResultRevealOverlayFading] = useState(false);
  const overlayFadeStartTimerRef = useRef<number | null>(null);
  const overlayFadeEndTimerRef = useRef<number | null>(null);

  useEffect(() => {
    fetchBivouacs()
      .then(setBivouacs)
      .catch((err: unknown) => setError(String(err)));
  }, []);

  useEffect(() => {
    return () => {
      clearTransitionTimers();
    };
  }, []);

  function clearTransitionTimers() {
    if (overlayFadeStartTimerRef.current !== null) {
      window.clearTimeout(overlayFadeStartTimerRef.current);
      overlayFadeStartTimerRef.current = null;
    }
    if (overlayFadeEndTimerRef.current !== null) {
      window.clearTimeout(overlayFadeEndTimerRef.current);
      overlayFadeEndTimerRef.current = null;
    }
  }

  function revealMapScreen() {
    setMode('result');
    setShowResultRevealOverlay(true);
    setResultRevealOverlayFading(false);

    overlayFadeStartTimerRef.current = window.setTimeout(() => {
      setResultRevealOverlayFading(true);
      overlayFadeStartTimerRef.current = null;
    }, 40);

    overlayFadeEndTimerRef.current = window.setTimeout(() => {
      setShowResultRevealOverlay(false);
      setResultRevealOverlayFading(false);
      overlayFadeEndTimerRef.current = null;
    }, RESULT_OVERLAY_FADE_MS + 40);
  }

  function startReveal(nextRoute: RouteResponse, nextConfig?: Config) {
    clearTransitionTimers();
    setMobileResultPanelOpen(false);
    setShowResultRevealOverlay(false);
    setResultRevealOverlayFading(false);

    if (nextConfig) {
      setConfig(nextConfig);
    }
    setRoute(nextRoute);
    setMode('reveal');
  }

  async function handleGenerate(nights: number, distancePerDay: number, pack: Pack, options: Options) {
    setLoading(true);
    setError(null);
    try {
      const result = await generateRoute(nights, distancePerDay);
      startReveal(result, { nights, distancePerDay, pack, options });
    } catch (err: unknown) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate() {
    if (!config) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateRoute(config.nights, config.distancePerDay);
      startReveal(result);
    } catch (err: unknown) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    clearTransitionTimers();
    setMobileResultPanelOpen(false);
    setShowResultRevealOverlay(false);
    setResultRevealOverlayFading(false);
    setMode('config');
    setRoute(null);
    setError(null);
  }

  if (mode === 'reveal' && route && config) {
    return (
      <div className="reveal-screen">
        <div className="reveal-orb reveal-orb--left" />
        <div className="reveal-orb reveal-orb--right" />
        <div className="reveal-content">
          <img src={brandLogo} alt="Trek and Reset" className="reveal-logo" />
          <p className="reveal-pretitle">Votre itineraire est pret</p>
          <h2>L&apos;aventure vous attend</h2>
          <button className="reveal-cta" type="button" onClick={revealMapScreen}>
            decouvrir mon itineraire
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'result' && route && config) {
    return (
      <div className="app app--result">
        <main className="result-map">
          <MapView bivouacs={bivouacs} route={route} />
          {showResultRevealOverlay && (
            <div
              className={`result-reveal-overlay ${resultRevealOverlayFading ? 'is-fading' : ''}`}
            >
              <div className="reveal-orb reveal-orb--left" />
              <div className="reveal-orb reveal-orb--right" />
              <div className="reveal-content">
                <img src={brandLogo} alt="Trek and Reset" className="reveal-logo" />
                <p className="reveal-pretitle">Votre itineraire est pret</p>
                <h2>L&apos;aventure vous attend</h2>
              </div>
            </div>
          )}
        </main>
        <aside
          id="result-panel"
          className={`result-panel ${mobileResultPanelOpen ? 'is-open' : 'is-collapsed'}`}
        >
          <button
            className="mobile-panel-toggle"
            type="button"
            onClick={() => setMobileResultPanelOpen((value) => !value)}
            aria-expanded={mobileResultPanelOpen}
            aria-controls="result-panel"
            aria-label={mobileResultPanelOpen ? 'Reduire le panneau' : 'Ouvrir le panneau'}
          >
            <span className={`mobile-panel-toggle-arrow ${mobileResultPanelOpen ? 'is-open' : ''}`}>
              ▴
            </span>
          </button>
          <RouteSummary
            route={route}
            nights={config.nights}
            pack={config.pack}
            options={config.options}
            onBack={handleBack}
            onRegenerate={handleRegenerate}
            loading={loading}
          />
          {error && <div className="error-banner">{error}</div>}
        </aside>
      </div>
    );
  }

  return (
    <div className="app app--config">
      <div className="config-page">
        <header className="brand-header">
          <img src={brandLogo} alt="Trek and Reset" className="brand-logo-image" />
          <div className="brand-text">
            <h1>Trek &amp; Reset</h1>
            <p>Ardennes · Itinéraires sur mesure</p>
          </div>
        </header>
        <main className="config-main">
          <RouteForm onGenerate={handleGenerate} loading={loading} />
          {error && <div className="error-banner">{error}</div>}
        </main>
        <footer className="config-footer">
          Au départ de La Roche-en-Ardenne · Belgique
        </footer>
      </div>
    </div>
  );
}

