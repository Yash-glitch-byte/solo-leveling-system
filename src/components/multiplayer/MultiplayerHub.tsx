import React, { useState } from 'react';
import { PlayerProfile, HunterFriend, HunterRank, PlayerPrivacySettings } from '../../types';
import { soundEngine } from '../../game/sound';

interface MultiplayerHubProps {
  player: PlayerProfile;
  friends: HunterFriend[];
  onUpdatePrivacy: (settings: Partial<PlayerPrivacySettings>) => void;
  onAddFriend: (newFriend: HunterFriend) => void;
  onRemoveFriend: (friendId: string) => void;
  onAcceptFriend: (friendId: string) => void;
  onBlockFriend: (friendId: string) => void;
}

export const MultiplayerHub: React.FC<MultiplayerHubProps> = ({
  player,
  friends,
  onUpdatePrivacy,
  onAddFriend,
  onRemoveFriend,
  onAcceptFriend,
  onBlockFriend
}) => {
  const [activeTab, setActiveTab] = useState<'allies' | 'requests' | 'search' | 'privacy'>('allies');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addHunterIdInput, setAddHunterIdInput] = useState<string>('');
  const [addHunterNameInput, setAddHunterNameInput] = useState<string>('');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const privacy = player.privacySettings || {
    isPublic: true,
    shareActivity: true,
    showOnlineStatus: true,
    shareStats: true
  };

  const hunterId = player.hunterId || 'HNT-7790';

  const activeAllies = friends.filter(f => f.friendshipStatus === 'friend' && !f.isBlocked);
  const pendingRequests = friends.filter(f => f.friendshipStatus.startsWith('pending') && !f.isBlocked);
  const blockedHunters = friends.filter(f => f.isBlocked);

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const id = addHunterIdInput.trim().toUpperCase();
    const name = addHunterNameInput.trim() || 'Hunter Ally';

    if (!id) {
      setStatusFeedback('Please enter a valid Hunter ID (e.g. HNT-4412).');
      return;
    }

    if (id === hunterId) {
      setStatusFeedback('You cannot add your own Hunter ID as a friend.');
      return;
    }

    if (friends.some(f => f.hunterId === id)) {
      setStatusFeedback('You already have a connection or pending request with this Hunter.');
      return;
    }

    soundEngine.playLevelUp();
    const newFriend: HunterFriend = {
      id: `friend-${Date.now()}`,
      hunterId: id,
      name,
      alias: 'Allied Hunter',
      avatarIcon: '🗡️',
      rank: 'E-Rank',
      level: 1,
      stats: { strength: 10, vitality: 10, intelligence: 10, focus: 10, discipline: 10 },
      status: 'offline',
      lastActive: new Date().toISOString().slice(0, 10),
      friendshipStatus: 'pending_outgoing'
    };

    onAddFriend(newFriend);
    setAddHunterIdInput('');
    setAddHunterNameInput('');
    setStatusFeedback(`✓ Friend invitation transmitted to [${id}]. Status: Pending Confirmation.`);
  };

  const copyHunterId = () => {
    soundEngine.playPing();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(hunterId);
      setStatusFeedback(`Copied Hunter ID [${hunterId}] to clipboard! Share this with peers to connect.`);
    }
  };

  return (
    <div className="multiplayer-hub-container" style={{ maxWidth: '960px', margin: '0 auto', padding: '16px' }}>
      {/* Top Protocol Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="hud-tag" style={{ borderColor: '#a855f7', color: '#c084fc' }}>
            ● MULTIPLAYER & HUNTER ALLIANCE NETWORK
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', margin: '4px 0 0 0', color: '#fff', fontSize: '1.4rem' }}>
            HUNTER GUILD & ALLIANCE TERMINAL
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#7f9ebc' }}>
            Connect with real fellow hunters, compare verified milestone progress, and participate in cooperative challenges.
          </span>
        </div>

        {/* Hunter Identity Badge & Copy ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid #a855f7', padding: '6px 12px', borderRadius: '8px' }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: '#c084fc', textTransform: 'uppercase', display: 'block' }}>Your Hunter ID</span>
            <strong style={{ fontSize: '0.95rem', color: '#fff', fontFamily: 'var(--font-mono)' }}>{hunterId}</strong>
          </div>
          <button
            onClick={copyHunterId}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#c084fc',
              fontSize: '0.74rem',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            📋 COPY ID
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {statusFeedback && (
        <div style={{ background: 'rgba(0, 210, 255, 0.1)', border: '1px solid #00f0ff', borderRadius: '6px', padding: '10px 14px', color: '#00f0ff', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{statusFeedback}</span>
          <button onClick={() => setStatusFeedback(null)} style={{ background: 'transparent', border: 'none', color: '#7f9ebc', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => { soundEngine.playPing(); setActiveTab('allies'); }}
          className={`hud-tab-btn ${activeTab === 'allies' ? 'active' : ''}`}
          style={{ padding: '8px 14px', fontSize: '0.82rem' }}
        >
          👥 Allies ({activeAllies.length})
        </button>
        <button
          onClick={() => { soundEngine.playPing(); setActiveTab('requests'); }}
          className={`hud-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          style={{ padding: '8px 14px', fontSize: '0.82rem' }}
        >
          📨 Requests ({pendingRequests.length})
        </button>
        <button
          onClick={() => { soundEngine.playPing(); setActiveTab('search'); }}
          className={`hud-tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          style={{ padding: '8px 14px', fontSize: '0.82rem' }}
        >
          ➕ Add Hunter
        </button>
        <button
          onClick={() => { soundEngine.playPing(); setActiveTab('privacy'); }}
          className={`hud-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
          style={{ padding: '8px 14px', fontSize: '0.82rem' }}
        >
          🛡️ Privacy & Guard
        </button>
      </div>

      {/* TAB 1: ALLIES LIST */}
      {activeTab === 'allies' && (
        <div>
          {activeAllies.length === 0 ? (
            <div className="hud-card" style={{ padding: '30px', textAlign: 'center', color: '#7f9ebc' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>⚔️</span>
              <h3 style={{ color: '#fff', margin: '0 0 6px 0', fontFamily: 'var(--font-display)' }}>No Hunter Allies Connected Yet</h3>
              <p style={{ fontSize: '0.84rem', margin: '0 0 16px 0', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
                System Reawaken connects real hunters without fabricating fake computer bot profiles. Share your Hunter ID or send a connection request to team up!
              </p>
              <button
                onClick={() => setActiveTab('search')}
                className="hud-btn-primary"
                style={{ padding: '10px 18px', fontSize: '0.84rem' }}
              >
                + ADD YOUR FIRST HUNTER ALLY
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {activeAllies.map(friend => (
                <div key={friend.id} className="hud-card" style={{ padding: '16px', position: 'relative' }}>
                  <div className="card-corner tl" />
                  <div className="card-corner tr" />
                  <div className="card-corner bl" />
                  <div className="card-corner br" />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
                      {friend.avatarIcon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: '#fff', fontSize: '0.95rem', display: 'block' }}>{friend.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#c084fc', fontFamily: 'var(--font-mono)' }}>{friend.hunterId}</span>
                      <span style={{ fontSize: '0.72rem', color: '#7f9ebc', display: 'block' }}>LV.{friend.level} • {friend.rank}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: friend.status === 'online' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)', color: friend.status === 'online' ? '#34d399' : '#7f9ebc', fontWeight: 700 }}>
                        ● {friend.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                    <button
                      onClick={() => onRemoveFriend(friend.id)}
                      style={{ flex: 1, padding: '6px', fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#7f9ebc', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Remove Connection
                    </button>
                    <button
                      onClick={() => onBlockFriend(friend.id)}
                      style={{ padding: '6px 10px', fontSize: '0.72rem', background: 'rgba(255, 51, 102, 0.1)', border: '1px solid #ff3366', color: '#ff6b81', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Block
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REQUESTS (INCOMING & OUTGOING) */}
      {activeTab === 'requests' && (
        <div>
          {pendingRequests.length === 0 ? (
            <div className="hud-card" style={{ padding: '24px', textAlign: 'center', color: '#7f9ebc' }}>
              <p style={{ margin: 0 }}>No pending friend requests or invitations at this time.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingRequests.map(req => (
                <div key={req.id} className="hud-card" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{req.avatarIcon}</span>
                    <div>
                      <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{req.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#c084fc', display: 'block', fontFamily: 'var(--font-mono)' }}>{req.hunterId}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {req.friendshipStatus === 'pending_incoming' ? (
                      <>
                        <button
                          onClick={() => { soundEngine.playLevelUp(); onAcceptFriend(req.id); }}
                          className="hud-btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.76rem' }}
                        >
                          ACCEPT ALLY
                        </button>
                        <button
                          onClick={() => { soundEngine.playPing(); onRemoveFriend(req.id); }}
                          style={{ padding: '6px 12px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#7f9ebc', cursor: 'pointer', fontSize: '0.76rem' }}
                        >
                          DECLINE
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.76rem', color: '#f59e0b', fontStyle: 'italic' }}>
                        Waiting for acceptance...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADD HUNTER FORM */}
      {activeTab === 'search' && (
        <div className="hud-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 6px 0', color: '#fff', fontFamily: 'var(--font-display)' }}>
            SEND HUNTER ALLIANCE INVITATION
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#7f9ebc', margin: '0 0 16px 0' }}>
            Enter a peer's unique Hunter ID to send an authenticated connection request.
          </p>

          <form onSubmit={handleSendRequest} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '480px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                HUNTER ID (Required)
              </label>
              <input
                type="text"
                value={addHunterIdInput}
                onChange={e => setAddHunterIdInput(e.target.value)}
                placeholder="e.g. HNT-4412"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: 'rgba(5, 12, 26, 0.95)', border: '1px solid #a855f7', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#7f9ebc', display: 'block', marginBottom: '4px' }}>
                ALLY NAME / ALIAS (Optional)
              </label>
              <input
                type="text"
                value={addHunterNameInput}
                onChange={e => setAddHunterNameInput(e.target.value)}
                placeholder="e.g. Study Partner / Gym Bro"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: 'rgba(5, 12, 26, 0.95)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', fontSize: '0.88rem' }}
              />
            </div>

            <button
              type="submit"
              className="hud-btn-primary"
              style={{ padding: '12px', fontSize: '0.86rem', marginTop: '6px' }}
            >
              TRANSMIT FRIEND INVITATION
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: PRIVACY & ACCESS CONTROLS */}
      {activeTab === 'privacy' && (
        <div className="hud-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 6px 0', color: '#fff', fontFamily: 'var(--font-display)' }}>
            ALLIANCE PRIVACY & EVIDENCE GUARDS
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#7f9ebc', margin: '0 0 16px 0' }}>
            You maintain full sovereignty over your personal data. Private evidence and uploaded logs are never exposed without explicit consent.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '6px' }}>
              <div>
                <strong style={{ color: '#fff', fontSize: '0.84rem', display: 'block' }}>Public Profile Visibility</strong>
                <span style={{ fontSize: '0.72rem', color: '#7f9ebc' }}>Allow verified peers to discover your rank & achievements</span>
              </div>
              <button
                onClick={() => onUpdatePrivacy({ isPublic: !privacy.isPublic })}
                style={{ padding: '4px 12px', borderRadius: '4px', background: privacy.isPublic ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)', border: `1px solid ${privacy.isPublic ? '#00f0ff' : '#64748b'}`, color: privacy.isPublic ? '#00f0ff' : '#64748b', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
              >
                {privacy.isPublic ? 'PUBLIC' : 'PRIVATE'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '6px' }}>
              <div>
                <strong style={{ color: '#fff', fontSize: '0.84rem', display: 'block' }}>Online Status Telemetry</strong>
                <span style={{ fontSize: '0.72rem', color: '#7f9ebc' }}>Display when you are active in Instant Dungeons</span>
              </div>
              <button
                onClick={() => onUpdatePrivacy({ showOnlineStatus: !privacy.showOnlineStatus })}
                style={{ padding: '4px 12px', borderRadius: '4px', background: privacy.showOnlineStatus ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)', border: `1px solid ${privacy.showOnlineStatus ? '#10b981' : '#64748b'}`, color: privacy.showOnlineStatus ? '#34d399' : '#64748b', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
              >
                {privacy.showOnlineStatus ? 'VISIBLE' : 'HIDDEN'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '6px' }}>
              <div>
                <strong style={{ color: '#fff', fontSize: '0.84rem', display: 'block' }}>Share Activity Feats</strong>
                <span style={{ fontSize: '0.72rem', color: '#7f9ebc' }}>Broadcast milestone boss triumphs and level-ups to allies</span>
              </div>
              <button
                onClick={() => onUpdatePrivacy({ shareActivity: !privacy.shareActivity })}
                style={{ padding: '4px 12px', borderRadius: '4px', background: privacy.shareActivity ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)', border: `1px solid ${privacy.shareActivity ? '#a855f7' : '#64748b'}`, color: privacy.shareActivity ? '#c084fc' : '#64748b', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
              >
                {privacy.shareActivity ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
