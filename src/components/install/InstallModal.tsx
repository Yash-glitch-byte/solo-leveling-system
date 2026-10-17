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
        style={{ maxWidth: '620px', width: '92%' }}
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

        {/* If native deferred prompt is available */}
        {deferredPrompt && (
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
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
                boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)'
              }}
            >
              ⚡ ONE-CLICK DIRECT INSTALL
            </button>
            <p style={{ color: '#00d2ff', fontSize: '0.8rem', marginTop: '8px' }}>
              ✦ Native browser install prompt detected! Tap above to install immediately.
            </p>
          </div>
        )}

        <div className="install-steps-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '55vh', overflowY: 'auto', paddingRight: '4px' }}>
          {/* Android Step */}
          <div className="install-card-step" style={{ background: 'rgba(0, 240, 255, 0.04)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>🤖</span>
              <strong style={{ color: '#38bdf8', fontSize: '1rem' }}>ANDROID (Google Chrome / Brave / Edge)</strong>
            </div>
            <ol style={{ paddingLeft: '20px', margin: 0, color: '#e2f1ff', fontSize: '0.88rem', lineHeight: '1.6' }}>
              <li>Open the app in Chrome: <code style={{ color: '#00f0ff' }}>yash-glitch-byte.github.io/solo-leveling-system/</code></li>
              <li>Tap the <strong>three dots menu (⋮)</strong> in the top-right corner of Chrome.</li>
              <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
              <li>Tap <strong>Install</strong> when prompted. The game icon will appear on your phone's app drawer and home screen as a standalone app!</li>
            </ol>
          </div>

          {/* iOS / iPhone Step */}
          <div className="install-card-step" style={{ background: 'rgba(192, 132, 252, 0.04)', border: '1px solid rgba(192, 132, 252, 0.2)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>🍎</span>
              <strong style={{ color: '#c084fc', fontSize: '1rem' }}>IPHONE & IPAD (Safari)</strong>
            </div>
            <ol style={{ paddingLeft: '20px', margin: 0, color: '#e2f1ff', fontSize: '0.88rem', lineHeight: '1.6' }}>
              <li>Open the URL in <strong>Safari</strong> (Apple does not permit home screen installation from inside Chrome on iOS).</li>
              <li>Tap the <strong>Share button</strong> <span style={{ color: '#00f0ff' }}>[⎋ / ↑]</span> at the bottom toolbar.</li>
              <li>Scroll down the share sheet and tap <strong>"Add to Home Screen"</strong> <span style={{ color: '#c084fc' }}>[+]</span>.</li>
              <li>Tap <strong>"Add"</strong> in the top right. SYSTEM REAWAKEN now launches in standalone full-screen mode!</li>
            </ol>
          </div>

          {/* PC / Laptop Step */}
          <div className="install-card-step" style={{ background: 'rgba(52, 211, 153, 0.04)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>💻</span>
              <strong style={{ color: '#34d399', fontSize: '1rem' }}>PC / LAPTOP (Chrome / Edge / Windows)</strong>
            </div>
            <ol style={{ paddingLeft: '20px', margin: 0, color: '#e2f1ff', fontSize: '0.88rem', lineHeight: '1.6' }}>
              <li>In your desktop browser address bar, click the <strong>Install icon (⊕)</strong> on the right side.</li>
              <li>Or click the <strong>three dots (⋮)</strong> → <strong>"Save and share"</strong> → <strong>"Install SYSTEM REAWAKEN"</strong>.</li>
              <li>It will launch in its own dedicated, borderless dark-fantasy game window on your PC taskbar!</li>
            </ol>
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
