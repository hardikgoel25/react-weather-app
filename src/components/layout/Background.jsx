import { useEffect, useState } from 'react';
import { effectFor, gradientFor } from '../../utils/theme.js';
import { useSettings } from '../../hooks/useSettings.js';

/**
 * Fixed full-screen gradient keyed by weather code + day/night + theme, with a
 * crossfade between gradients and optional decorative particle layers.
 */
export function Background({ code, isDay = true }) {
  const { resolvedTheme, reducedMotion } = useSettings();
  const gradient = gradientFor(code, isDay, resolvedTheme);
  const effect = effectFor(code, isDay);

  // Stack of at most two layers: the previous gradient underneath, the new one fading in on top.
  const [layers, setLayers] = useState(() => [{ id: 0, gradient }]);
  const top = layers[layers.length - 1];
  if (top.gradient !== gradient) {
    // Render-phase state update (React's recommended pattern for derived state).
    setLayers([top, { id: top.id + 1, gradient }]);
  }

  useEffect(() => {
    if (layers.length < 2) return undefined;
    const timer = setTimeout(() => setLayers((prev) => prev.slice(-1)), 1100);
    return () => clearTimeout(timer);
  }, [layers]);

  const showEffects = !reducedMotion;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {layers.map((layer, index) => (
        <div
          key={layer.id}
          className={index > 0 ? 'absolute inset-0 animate-fade-in' : 'absolute inset-0'}
          style={{ background: layer.gradient, animationDuration: '1000ms' }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(255_255_255/0.14),transparent_60%)]" />
      {showEffects && effect === 'rain' && (
        <>
          <div className="fx-rain absolute -inset-[12%]" />
          <div className="fx-rain-far absolute -inset-[12%]" />
        </>
      )}
      {showEffects && effect === 'snow' && (
        <>
          <div className="fx-snow absolute -inset-[12%]" />
          <div className="fx-snow-far absolute -inset-[12%]" />
        </>
      )}
      {showEffects && effect === 'fog' && <div className="fx-fog absolute -inset-[8%]" />}
      {effect === 'stars' && <div className="fx-stars absolute inset-x-0 top-0 h-2/3" />}
    </div>
  );
}
