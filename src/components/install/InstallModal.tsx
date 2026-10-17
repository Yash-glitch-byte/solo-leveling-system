import React from 'react';
import { soundEngine } from '../../game/sound';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onNativeInstall: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onNativeInstall
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="hud-card modal-container install-guide-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '92%' }}
      >
        <div className="card-corner top-left"></div>
        <div className="card-corner top-right"></div>
        <div className="card-corner bottom-left"></div>
        <div className="card-corner bottom-right"></div>

        <div className="modal-header">
          <div className="modal-badge-tag">[ SYSTEM ACQUISITION PROTOCOL ]</div>
          <h2 className="modal-title" style={{ color: '#00f0ff' }}>
            📲 INSTALL SYSTEM REAWAKEN
          </h2>
          <p className="modal-subtitle" style={{ color: '#7f9ebc', fontSize: '0.9rem', marginTop: '4px' }}>
            Install as a standalone native-grade application on your mobile phone or PC for instant offline combat.
          </p>
        </div>

        {/* IN-APP BROWSER ALERT & DIRECT CHROME LAUNCH */}
        <div style={{
          background: 'rgba(255, 170, 0, 0.08)',
          border: '1px solid #ffaa00',
          borderRadius: '8px',
          padding: '12px 14px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <strong style={{ color: '#ffaa00', fontSize: '0.92rem' }}>DID CHROME DOWNLOAD AN OFFLINE PAGE?</strong>
          </div>
          <p style={{ color: '#e2f1ff', fontSize: '0.85rem', margin: '0 0 10px 0', lineHeight: '1.5' }}>
            If tapping the three dots (<strong>⋮</strong>) downloaded an offline web page file, you are currently inside an <strong>In-App Preview Browser</strong> (e.g., opened from WhatsApp, Discord, or Gmail). In-app browsers do not allow home-screen installation.
          </p>
          <a
            href="intent://yash-glitch-byte.github.io/solo-leveling-system/#Intent;scheme=https;package=com.android.chrome;end"
            className="hud-btn-primary"
            style={{
              display: 'block',
              textAlign: 'center',
              textDecoration: 'none',
              padding: '12px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              fontSize: '0.95rem'
            }}
          >
            🌐 SWITCH TO FULL GOOGLE CHROME APP
          </a>
          <p style={{ color: '#7f9ebc', fontSize: '0.78rem', margin: '6px 0 0 0', textAlign: 'center' }}>
            Or tap the <strong>three dots (⋮)</strong> at the very top right and tap <strong>"Open in Chrome"</strong>
          </p>
        </div>

        {/* If native deferred prompt is available */}
        {deferredPrompt && (
          <div style={{ marginBottom: '18px', textAlign: 'center' }}>
            <button
              className="hud-btn-primary"
              onClick={() => {
                soundEngine.playLevelUp();
                onNativeInstall();
              }}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.1rem',
                letterSpacing: '2px',
                boxShadow: '0 0 25px rgba(0, 240, 255, 0.45)'
              }}
            >
              ⚡ ONE-CLICK DIRECT INSTALL
            </button>
            <p style={{ color: '#00d2ff', fontSize: '0.8rem', marginTop: '8px' }}>
              ✦ Native browser install prompt ready! Tap above to install to home screen immediately.
            </p>
          </div>
        )}

        <div className="install-steps-grid" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '45vh', overflowY: 'auto', paddingRight: '4px' }}>
          {/* Android Step */}
          <div className="install-card-step" style={{ background: 'rgba(0, 240, 255, 0.04)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>🤖</span>
              <strong style={{ color: '#38bdf8', fontSize: '1rem' }}>ON ANDROID (In Google Chrome)</strong>
            </div>
            <ol style={{ paddingLeft: '20px', margin: 0, color: '#e2f1ff', fontSize: '0.88rem', lineHeight: '1.6' }}>
              <li>Make sure you are in the full <strong>Chrome app</strong> (not the in-app preview).</li>
              <li>Tap the <strong>three dots menu (⋮)</strong> in the top-right corner.</li>
              <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong> (look for the phone icon or plus sign, not the download arrow).</li>
              <li>Tap <strong>Install</strong> when prompted. The custom dark-fantasy app icon will be added to your home screen!</li>
            </ol>
          </div>

          {/* iOS / iPhone Step */}
          <div className="install-card-step" style={{ background: 'rgba(192, 132, 252, 0.04)', border: '1px solid rgba(192, 132, 252, 0.2)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>🍎</span>
              <strong style={{ color: '#c084fc', fontSize: '1rem' }}>ON IPHONE & IPAD (Safari)</strong>
            </div>
            <ol style={{ paddingLeft: '20px', margin: 0, color: '#e2f1ff', fontSize: '0.88rem', lineHeight: '1.6' }}>
              <li>Open the link in <strong>Safari</strong>.</li>
              <li>Tap the <strong>Share button</strong> <span style={{ color: '#00f0ff' }}>[⎋ / ↑]</span> at the bottom toolbar.</li>
              <li>Scroll down the menu and tap <strong>"Add to Home Screen"</strong> <span style={{ color: '#c084fc' }}>[+]</span>.</li>
              <li>Tap <strong>"Add"</strong> in the top right. SYSTEM REAWAKEN now launches in standalone full-screen mode!</li>
            </ol>
          </div>

          {/* PC / Laptop Step */}
          <div className="install-card-step" style={{ background: 'rgba(52, 211, 153, 0.04)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>💻</span>
              <strong style={{ color: '#34d399', fontSize: '1rem' }}>ON PC & LAPTOP (Chrome / Edge / Windows)</strong>
            </div>
            <ol style={{ paddingLeft: '20px', margin: 0, color: '#e2f1ff', fontSize: '0.88rem', lineHeight: '1.6' }}>
              <li>In your browser address bar (top right, near the star bookmark icon), click the <strong>Install icon (⊕)</strong>.</li>
              <li>Or click the <strong>three dots (⋮)</strong> → <strong>"Save and share"</strong> → <strong>"Install SYSTEM REAWAKEN"</strong>.</li>
              <li>The game launches in its own dedicated window and pins to your Windows taskbar!</li>
            </ol>
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            className="hud-btn-primary"
            onClick={() => {
              soundEngine.playPing();
              onClose();
            }}
          >
            DISMISS PROTOCOL
          </button>
        </div>
      </div>
    </div>
  );
};
