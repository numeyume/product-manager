// PWA utilities for background notifications and install prompts

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export class PWAManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private deferredPrompt: any = null;

  constructor() {
    console.log('PWA Manager disabled for stability');
    // this.initializeServiceWorker();
    // this.setupInstallPrompt();
  }

  // Service Worker の初期化 (一時的に無効化)
  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        console.log('Service Worker registration temporarily disabled for Google Auth testing');
        return;
        // this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        // console.log('Service Worker registered successfully');
        
        // Background sync の登録
        if ('sync' in window.ServiceWorkerRegistration.prototype) {
          // TypeScript の型制約のため、any でキャスト
          const swWithSync = this.swRegistration as any;
          if (swWithSync.sync) {
            await swWithSync.sync.register('background-check');
          }
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // インストールプロンプトの設定
  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
    });
  }

  // PWA インストールプロンプトを表示
  public async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    
    return outcome === 'accepted';
  }

  // プッシュ通知の許可を要求
  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // ローカル通知をスケジュール
  public async scheduleLocalNotification(options: NotificationOptions, delay: number = 0) {
    const hasPermission = await this.requestNotificationPermission();
    if (!hasPermission) return false;

    const scheduleNotification = () => {
      if (this.swRegistration) {
        this.swRegistration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/logo192.png',
          badge: options.badge || '/logo192.png',
          tag: options.tag,
          requireInteraction: options.requireInteraction,
          actions: options.actions,
          data: {
            timestamp: Date.now(),
            url: window.location.origin
          }
        });
      }
    };

    if (delay > 0) {
      setTimeout(scheduleNotification, delay);
    } else {
      scheduleNotification();
    }

    return true;
  }

  // 買い物リマインダーの設定
  public setupShoppingReminders() {
    // 週末の夕方（金曜・土曜 19:00-21:00）
    this.scheduleWeeklyReminder(5, 19, {
      title: '📦 週末の買い物前チェック',
      body: '週末の買い物前に在庫を確認しませんか？',
      tag: 'weekend-shopping',
      requireInteraction: true,
      actions: [
        { action: 'check-stock', title: '在庫確認' },
        { action: 'dismiss', title: '後で' }
      ]
    });

    // 平日のランチタイム（月-金 12:00-13:00）
    this.scheduleWeeklyReminder(1, 12, {
      title: '🛒 ランチタイム買い物チェック',
      body: 'お昼休みの買い物前に重複がないか確認しましょう',
      tag: 'lunch-shopping',
      actions: [
        { action: 'quick-check', title: 'クイック確認' },
        { action: 'dismiss', title: 'スキップ' }
      ]
    });
  }

  // 週次リマインダーのスケジュール
  private scheduleWeeklyReminder(dayOfWeek: number, hour: number, options: NotificationOptions) {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();

    // 次回の通知時刻を計算
    let daysUntilTarget = dayOfWeek - currentDay;
    if (daysUntilTarget < 0 || (daysUntilTarget === 0 && currentHour >= hour)) {
      daysUntilTarget += 7;
    }

    const targetTime = new Date();
    targetTime.setDate(targetTime.getDate() + daysUntilTarget);
    targetTime.setHours(hour, 0, 0, 0);

    const delay = targetTime.getTime() - now.getTime();
    
    if (delay > 0) {
      setTimeout(() => {
        this.scheduleLocalNotification(options);
        // 次の週も繰り返し設定
        this.scheduleWeeklyReminder(dayOfWeek, hour, options);
      }, delay);
    }
  }

  // 在庫切れアラートの設定
  public setupLowStockAlerts(products: any[]) {
    const lowStockProducts = products.filter(p => (p.remainingQuantity || 0) <= 1);
    
    if (lowStockProducts.length > 0) {
      this.scheduleLocalNotification({
        title: '⚠️ 在庫が少なくなっています',
        body: `${lowStockProducts.length}個の商品の在庫が残りわずかです`,
        tag: 'low-stock-alert',
        requireInteraction: true,
        actions: [
          { action: 'view-low-stock', title: '確認する' },
          { action: 'remind-tomorrow', title: '明日通知' }
        ]
      });
    }
  }

  // 購買パターン学習アラート
  public setupPatternBasedAlerts(shoppingHistory: any[]) {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // ユーザーの購買パターンを分析
    const patterns = this.analyzeShoppingPatterns(shoppingHistory);

    // パターンに基づいてアラートを設定
    if (patterns.isTypicalShoppingTime(dayOfWeek, hour)) {
      this.scheduleLocalNotification({
        title: '🛍️ いつもの買い物時間です',
        body: '重複購入を防ぐため、在庫をチェックしませんか？',
        tag: 'pattern-based-alert',
        actions: [
          { action: 'check-before-shopping', title: '購入前チェック' },
          { action: 'skip-today', title: '今日はスキップ' }
        ]
      });
    }
  }

  // 購買パターンの分析
  private analyzeShoppingPatterns(history: any[]) {
    const hourCounts: { [key: number]: number } = {};
    const dayCounts: { [key: number]: number } = {};

    history.forEach(item => {
      if (item.purchaseDate) {
        const date = new Date(item.purchaseDate);
        const hour = date.getHours();
        const day = date.getDay();

        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      }
    });

    return {
      isTypicalShoppingTime: (dayOfWeek: number, hour: number) => {
        const dayThreshold = Math.max(2, history.length * 0.1);
        const hourThreshold = Math.max(1, history.length * 0.05);
        
        return (dayCounts[dayOfWeek] || 0) >= dayThreshold && 
               (hourCounts[hour] || 0) >= hourThreshold;
      },
      mostActiveDay: Object.keys(dayCounts).reduce((a, b) => 
        dayCounts[Number(a)] > dayCounts[Number(b)] ? a : b
      ),
      mostActiveHour: Object.keys(hourCounts).reduce((a, b) => 
        hourCounts[Number(a)] > hourCounts[Number(b)] ? a : b
      )
    };
  }

  // アプリがインストール可能かチェック
  public canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  // PWA機能が利用可能かチェック
  public isPWASupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // オフライン状態の検出
  public setupOfflineDetection() {
    window.addEventListener('online', () => {
      this.scheduleLocalNotification({
        title: '🌐 オンラインに復旧しました',
        body: 'データの同期を確認しています...',
        tag: 'online-status'
      });
    });

    window.addEventListener('offline', () => {
      this.scheduleLocalNotification({
        title: '📴 オフラインモード',
        body: 'オフラインでも基本機能は利用できます',
        tag: 'offline-status'
      });
    });
  }
}

// シングルトンインスタンス
export const pwaManager = new PWAManager();