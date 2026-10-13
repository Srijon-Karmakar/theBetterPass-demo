import React, { Suspense, lazy, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './app-splash-screen.css';

const LazyGlobe = lazy(async () => ({
  default: (await import('./ui/globe')).Globe,
}));

let activeSplashes = 0;

type AppSplashScreenProps = {
  exiting?: boolean;
  lightweight?: boolean;
  actionHref?: string;
  onAction?: () => void;
  actionLabel?: string;
};

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  exiting = false,
  lightweight = false,
  actionHref,
  onAction,
  actionLabel = 'Lets go',
}) => {
  useEffect(() => {
    // Several splash screens can be mounted at once (the gate and the loading fallbacks); count them so one
    // unmounting does not strip the class while another is still showing.
    activeSplashes += 1;
    document.body.classList.add('app-splash-active');
    return () => {
      activeSplashes -= 1;
      if (activeSplashes <= 0) document.body.classList.remove('app-splash-active');
    };
  }, []);

  return (
  <div
    className={`app-splash-screen${exiting ? ' is-exiting' : ''}${
      lightweight ? ' is-lightweight' : ''
    }`}
    role="status"
    aria-label="Loading The Better Pass"
  >
    <div className="app-splash-logo">
      <img src="/logo/final-logo.png" alt="The Better Pass" />
    </div>

    <div className="app-splash-copy">
      <h1>Ready for your next unforgettable trip?</h1>
      <p>
        Find trusted local guides, exciting experiences, and easy bookings with
        The Better Pass.
      </p>
    </div>

    <div className="app-splash-globe-mask">
      <div className="app-splash-globe-ground" />

      {lightweight ? (
        <div
          className="app-splash-globe app-splash-globe-placeholder"
          aria-hidden="true"
        />
      ) : (
        <Suspense
          fallback={
            <div
              className="app-splash-globe app-splash-globe-placeholder"
              aria-hidden="true"
            />
          }
        >
          <LazyGlobe
            className="app-splash-globe"
            aria-hidden="true"
            config={{
              dark: 0,
              diffuse: 0.88,
              mapSamples: 1200,
              mapBrightness: 4.4,
              baseColor: [0.9, 0.9, 0.88],
              glowColor: [0.96, 0.96, 0.93],
              markerColor: [0.4, 0.4, 0.38],
              scale: 1.08,
              offset: [-0.02, 0.07],
              markers: [],
            }}
          />
        </Suspense>
      )}

      {actionHref ? (
        <Link
          className="app-splash-action"
          to={actionHref}
          aria-label={actionLabel}
        >
          <span>{actionLabel}</span>
        </Link>
      ) : onAction ? (
        <button
          type="button"
          className="app-splash-action"
          onClick={onAction}
          aria-label={actionLabel}
        >
          <span>{actionLabel}</span>
        </button>
      ) : null}

      <div className="app-splash-globe-fade" />
    </div>
  </div>
);
};
