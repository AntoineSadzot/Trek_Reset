import { useState } from 'react';
import type { Pack, Options } from '../types';
import './RouteForm.css';

type Step = 1 | 2 | 3;

const PACKS: { id: Pack; name: string; km: number; icon: string; desc: string }[] = [
  {
    id: 'sherpa',
    name: 'Sherpa',
    km: 10,
    icon: '🥾',
    desc: 'Idéal pour découvrir les Ardennes à votre rythme',
  },
  {
    id: 'nomade',
    name: 'Nomade',
    km: 15,
    icon: '🧭',
    desc: 'Le classique pour les randonneurs habitués',
  },
  {
    id: 'explorer',
    name: 'Explorer',
    km: 20,
    icon: '🔭',
    desc: 'Pour les confirmés qui veulent repousser leurs limites',
  },
];

const NIGHTS_OPTIONS = [1, 2, 3, 4];

interface Props {
  onGenerate: (nights: number, distancePerDay: number, pack: Pack, options: Options) => void;
  loading: boolean;
}

export function RouteForm({ onGenerate, loading }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [nights, setNights] = useState<number | null>(null);
  const [pack, setPack] = useState<Pack | null>(null);
  const [options, setOptions] = useState<Options>({
    repasLyophilise: false,
    kitBivouac: false,
    panierTerroir: false,
  });

  const isSherpa = pack === 'sherpa';
  const packData = PACKS.find((p) => p.id === pack);

  function toggleOption(key: keyof Options) {
    setOptions((o) => ({ ...o, [key]: !o[key] }));
  }

  function handleSelectNights(n: number) {
    setNights(n);
    setStep(2);
  }

  function handleSelectPack(p: Pack) {
    setPack(p);
    if (p === 'sherpa') {
      setOptions((o) => ({ ...o, repasLyophilise: false, kitBivouac: false }));
    }
    setStep(3);
  }

  function goToStep(s: Step) {
    if (s < step) setStep(s);
  }

  function handleSubmit() {
    if (!nights || !pack) return;
    const distancePerDay = { sherpa: 10, nomade: 15, explorer: 20 }[pack];
    onGenerate(nights, distancePerDay, pack, options);
  }

  return (
    <div className="wizard">
      {/* Step indicator */}
      <div className="step-indicator">
        {([1, 2, 3] as Step[]).map((s) => (
          <div
            key={s}
            className={`step-dot ${step >= s ? 'active' : ''} ${step > s ? 'done' : ''}`}
            onClick={() => goToStep(s)}
          >
            <div className="step-circle">{step > s ? '✓' : s}</div>
            <span className="step-label">
              {s === 1 ? 'Durée' : s === 2 ? 'Formule' : 'Options'}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Duration */}
      {step === 1 && (
        <div className="wizard-step">
          <h2 className="step-title">Combien de nuits ?</h2>
          <p className="step-subtitle">Choisissez la durée de votre séjour en Ardennes</p>
          <div className="nights-grid">
            {NIGHTS_OPTIONS.map((n) => (
              <button
                key={n}
                className={`night-card ${nights === n ? 'selected' : ''}`}
                onClick={() => handleSelectNights(n)}
              >
                <span className="night-number">{n}</span>
                <span className="night-label">nuit{n > 1 ? 's' : ''}</span>
                <span className="night-sub">{n + 1} jours de marche</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Pack */}
      {step === 2 && (
        <div className="wizard-step">
          <h2 className="step-title">Votre formule</h2>
          <p className="step-subtitle">Choisissez l'intensité de votre trek</p>
          <div className="packs-grid">
            {PACKS.map((p) => (
              <button
                key={p.id}
                className={`pack-card ${pack === p.id ? 'selected' : ''}`}
                onClick={() => handleSelectPack(p.id)}
              >
                <span className="pack-icon">{p.icon}</span>
                <div className="pack-body">
                  <div className="pack-header-row">
                    <span className="pack-name">{p.name}</span>
                    <span className="pack-km">{p.km} km / jour</span>
                  </div>
                  <span className="pack-desc">{p.desc}</span>
                </div>
                {pack === p.id && <span className="pack-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Options + CTA */}
      {step === 3 && (
        <div className="wizard-step">
          <h2 className="step-title">Options</h2>
          <p className="step-subtitle">Personnalisez votre expérience</p>

          <div className="options-list">
            <OptionToggle
              icon="🥘"
              title="Kit repas lyophilisés"
              desc="Repas complets déshydratés pour chaque nuit"
              checked={options.repasLyophilise}
              disabled={isSherpa}
              disabledReason="Disponible à partir du pack Nomade"
              onChange={() => toggleOption('repasLyophilise')}
            />
            <OptionToggle
              icon="⛺"
              title="Kit bivouac"
              desc="Tente légère, tapis de sol et sac de couchage"
              checked={options.kitBivouac}
              disabled={isSherpa}
              disabledReason="Disponible à partir du pack Nomade"
              onChange={() => toggleOption('kitBivouac')}
            />
            <OptionToggle
              icon="🧺"
              title="Panier terroir"
              desc="Produits locaux ardennais à déguster en chemin"
              checked={options.panierTerroir}
              disabled={false}
              onChange={() => toggleOption('panierTerroir')}
            />
          </div>

          {/* Recap */}
          <div className="wizard-recap">
            <div className="recap-item">
              <span>Durée</span>
              <strong>{nights} nuit{(nights ?? 0) > 1 ? 's' : ''}</strong>
            </div>
            <div className="recap-divider" />
            <div className="recap-item">
              <span>Formule</span>
              <strong>{packData?.name} · {packData?.km} km/j</strong>
            </div>
          </div>

          <button className="cta-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Génération en cours…' : 'Générer mon itinéraire →'}
          </button>
        </div>
      )}

      {/* Back navigation */}
      {step > 1 && !loading && (
        <button className="back-link" onClick={() => setStep((step - 1) as Step)}>
          ← Retour
        </button>
      )}
    </div>
  );
}

interface OptionToggleProps {
  icon: string;
  title: string;
  desc: string;
  checked: boolean;
  disabled: boolean;
  disabledReason?: string;
  onChange: () => void;
}

function OptionToggle({ icon, title, desc, checked, disabled, disabledReason, onChange }: OptionToggleProps) {
  return (
    <label className={`option-toggle ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} />
      <span className="option-icon">{icon}</span>
      <div className="option-text">
        <span className="option-title">{title}</span>
        <span className="option-desc">{disabled ? disabledReason : desc}</span>
      </div>
      <span className="option-check">{checked && '✓'}</span>
    </label>
  );
}

