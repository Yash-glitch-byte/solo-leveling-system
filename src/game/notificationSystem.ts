// SYSTEM REAWAKEN — Browser Notifications & Hydration Alerts Engine

export interface SystemNotificationMessage {
  id: string;
  title: string;
  body: string;
  icon?: string;
  timestamp: number;
}

export class SystemNotificationEngine {
  private hasPermission: boolean = false;
  private hydrationTimer: any = null;
  private listeners: Array<(msg: SystemNotificationMessage) => void> = [];
  private history: SystemNotificationMessage[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.hasPermission = Notification.permission === 'granted';
    }
  }

  public getPermissionStatus(): string {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      if (this.hasPermission) {
        this.sendNotification(
          '⚔️ SYSTEM PROTOCOL SYNCHRONIZED',
          'Hunter push notifications and biological reminders are now active.',
          '⚡'
        );
        this.startHydrationInterval();
      }
      return this.hasPermission;
    } catch {
      return false;
    }
  }

  public sendNotification(title: string, body: string, icon: string = '⚡') {
    const msg: SystemNotificationMessage = {
      id: `notif-${Date.now()}`,
      title,
      body,
      icon,
      timestamp: Date.now()
    };

    this.history.unshift(msg);
    if (this.history.length > 20) this.history.pop();

    // Broadcast to in-app toaster listeners
    this.listeners.forEach(cb => cb(msg));

    // Native browser push notification
    if (this.hasPermission && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        new Notification(title, {
          body,
          icon: '/assets/icon-192.png',
          badge: '/assets/icon-192.png'
        });
      } catch (err) {
        console.warn('Native notification dispatch note:', err);
      }
    }
  }

  public startHydrationInterval() {
    if (this.hydrationTimer) clearInterval(this.hydrationTimer);
    // Biological hydration reminder every 45 minutes
    this.hydrationTimer = setInterval(() => {
      this.sendNotification(
        '💧 HYDRATION & RECOVERY PROTOCOL',
        'Hunter, drink 250ml pure water now to flush metabolic fatigue and sustain cognitive endurance.',
        '💧'
      );
    }, 45 * 60 * 1000);
  }

  public subscribe(cb: (msg: SystemNotificationMessage) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  public getHistory(): SystemNotificationMessage[] {
    return this.history;
  }
}

export const notificationEngine = new SystemNotificationEngine();
