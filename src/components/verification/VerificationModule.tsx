import React, { useState } from 'react';
import { BleWearableState, VerificationTier } from '../../types';
import { soundEngine } from '../../game/sound';

interface VerificationModuleProps {
  wearable: BleWearableState;
  onUpdateWearable: (state: Partial<BleWearableState>) => void;
}

export const VerificationModule: React.FC<VerificationModuleProps> = ({
  wearable,
  onUpdateWearable
}) => {
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const connectBleHeartRate = async () => {
    soundEngine.playPing();
    setErrorMsg(null);

    const nav = navigator as any;
    if (typeof navigator === 'undefined' || !nav.bluetooth) {
      setErrorMsg('Web Bluetooth is not supported on this browser or platform. Using manual biometric fallback.');
      return;
    }

    try {
      setConnecting(true);
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service']
      });

      const server = await device.gatt?.connect();
      if (!server) throw new Error('Could not connect to GATT Server');

      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        // Parse Heart Rate Measurement (flags byte 0, BPM byte 1)
        const flags = value.getUint8(0);
        const bpm = (flags & 0x01) ? value.getUint16(1, true) : value.getUint8(1);

        onUpdateWearable({
          currentHeartRate: bpm,
          lastReadingTime: Date.now()
        });
      });

      onUpdateWearable({
        supported: true,
        connected: true,
        deviceName: device.name || 'Bluetooth Heart Rate Monitor'
      });
      soundEngine.playLevelUp();
    } catch (err: any) {
      console.warn('[BLE NOTICE]', err);
      setErrorMsg(err.name === 'NotFoundError' ? 'Pairing cancelled by user.' : err.message);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectBle = () => {
    soundEngine.playPing();
    onUpdateWearable({
      connected: false,
      currentHeartRate: undefined,
      deviceName: undefined
    });
  };

  return (
    <div className="verification-module-container">
      {/* Header */}
      <div className="verification-header">
        <div>
          <span className="hud-tag">[OBJECTIVE TRUTH PROTOCOL]</span>
          <h2 className="section-title">TASK VERIFICATION & BIOMETRIC SENSORS</h2>
        </div>
        <p className="verification-desc">
          System Reawaken honors honest progress. We distinguish self-reported work from sensor-supported biometric evidence without pretending that ordinary phone sensors can magically verify deep focus.
        </p>
      </div>

      {/* Verification Tiers Overview Grid */}
      <div className="verification-tiers-grid">
        <div className="hud-card tier-card">
          <span className="tier-pill tier-self">TIER 1: SELF-REPORTED</span>
          <h4>Honest Integrity</h4>
          <p>Standard task completion based on the Hunter's personal honor code and consistency tracking.</p>
        </div>

        <div className="hud-card tier-card">
          <span className="tier-pill tier-evidence">TIER 2: EVIDENCE ATTACHED</span>
          <h4>Verifiable Proof</h4>
          <p>Attach GitHub commit URLs, study session notes, problem IDs, or document links directly to quests.</p>
        </div>

        <div className="hud-card tier-card">
          <span className="tier-pill tier-sensor">TIER 3: SENSOR SUPPORTED</span>
          <h4>Biometric Telemetry</h4>
          <p>Pair compatible Bluetooth Low Energy (BLE) heart rate monitors during physical workouts.</p>
        </div>

        <div className="hud-card tier-card">
          <span className="tier-pill tier-milestone">TIER 4: MILESTONE AUDITED</span>
          <h4>Demonstrated Mastery</h4>
          <p>Tested through mock interviews, full exam practice runs, and code repository launches.</p>
        </div>
      </div>

      {/* BLE Heart Rate Wearable Monitor Section */}
      <div className="hud-card wearable-pairing-card">
        <div className="card-corner tl" />
        <div className="card-corner tr" />
        <div className="card-corner bl" />
        <div className="card-corner br" />

        <div className="wearable-card-header">
          <div>
            <span className="hud-tag">[BLUETOOTH LOW ENERGY GATT]</span>
            <h3 className="wearable-title">HEART RATE MONITOR PAIRING</h3>
          </div>
          <span className={`ble-status-pill ${wearable.connected ? 'connected' : 'disconnected'}`}>
            {wearable.connected ? `CONNECTED: ${wearable.deviceName}` : 'NO SENSOR CONNECTED'}
          </span>
        </div>

        <p className="wearable-notice">
          Connect a standard BLE chest strap or smartwatch (Polar, Garmin, Apple Watch with BLE broadcast, Wahoo). Heart rate data is kept 100% private in local memory and is never transmitted to external cloud endpoints.
        </p>

        {wearable.connected ? (
          <div className="live-heart-rate-display">
            <div className="heart-rate-meter">
              <span className="pulse-heart-icon">❤️</span>
              <span className="bpm-digits">{wearable.currentHeartRate || '--'}</span>
              <span className="bpm-unit">BPM</span>
            </div>
            <div className="sensor-actions">
              <button className="hud-btn-danger" onClick={disconnectBle}>
                DISCONNECT SENSOR
              </button>
            </div>
          </div>
        ) : (
          <div className="connect-sensor-box">
            <button
              className="hud-btn-primary pair-ble-btn"
              disabled={connecting}
              onClick={connectBleHeartRate}
            >
              {connecting ? 'SCANNING FOR BLE MONITORS...' : '✦ PAIR BLUETOOTH HEART RATE SENSOR'}
            </button>
            {errorMsg && <p className="ble-error-text">Notice: {errorMsg}</p>}
          </div>
        )}

        <div className="medical-disclaimer-box">
          <span className="disclaimer-label">IMPORTANT NOTICE:</span>
          <span>
            Heart rate telemetry is used purely as personal motivation and fatigue estimation. The System does not provide medical diagnoses, treatment, or health certifications.
          </span>
        </div>
      </div>
    </div>
  );
};
