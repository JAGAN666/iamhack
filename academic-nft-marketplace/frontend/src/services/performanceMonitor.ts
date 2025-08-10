interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'load' | 'network' | 'render' | 'blockchain' | 'user-interaction';
  tags?: Record<string, string>;
}

interface PageLoadMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  totalPageSize: number;
  loadTime: number;
  resourceCount: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private isEnabled: boolean = true;
  private maxMetricsStorage: number = 1000;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals();
      this.initializeResourceTiming();
      this.initializeUserTiming();
      this.startPeriodicCleanup();
    }
  }

  // Initialize Core Web Vitals monitoring
  private initializeWebVitals() {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric({
          name: 'largest_contentful_paint',
          value: lastEntry.startTime,
          timestamp: Date.now(),
          category: 'load',
          tags: { url: window.location.pathname }
        });
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric({
            name: 'first_input_delay',
            value: entry.processingStart - entry.startTime,
            timestamp: Date.now(),
            category: 'user-interaction',
            tags: { url: window.location.pathname, inputType: entry.name }
          });
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);

      // Cumulative Layout Shift
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        
        this.recordMetric({
          name: 'cumulative_layout_shift',
          value: clsScore,
          timestamp: Date.now(),
          category: 'load',
          tags: { url: window.location.pathname }
        });
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
    }
  }

  // Initialize resource timing monitoring
  private initializeResourceTiming() {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          // Track slow resources (>1 second)
          if (entry.duration > 1000) {
            this.recordMetric({
              name: 'slow_resource',
              value: entry.duration,
              timestamp: Date.now(),
              category: 'network',
              tags: {
                url: window.location.pathname,
                resourceType: entry.initiatorType,
                resourceUrl: entry.name,
                cacheStatus: entry.transferSize === 0 ? 'cached' : 'network'
              }
            });
          }

          // Track failed resources
          if (entry.transferSize === 0 && entry.duration > 0) {
            this.recordMetric({
              name: 'failed_resource',
              value: 1,
              timestamp: Date.now(),
              category: 'network',
              tags: {
                url: window.location.pathname,
                resourceType: entry.initiatorType,
                resourceUrl: entry.name
              }
            });
          }
        });
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    }
  }

  // Initialize user timing monitoring
  private initializeUserTiming() {
    if ('PerformanceObserver' in window) {
      const userTimingObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric({
            name: entry.name,
            value: entry.duration || entry.startTime,
            timestamp: Date.now(),
            category: entry.entryType === 'measure' ? 'render' : 'user-interaction',
            tags: { url: window.location.pathname, type: entry.entryType }
          });
        });
      });
      
      userTimingObserver.observe({ entryTypes: ['mark', 'measure'] });
      this.observers.set('userTiming', userTimingObserver);
    }
  }

  // Record blockchain operation performance
  trackBlockchainOperation(operationName: string, duration: number, success: boolean, chainId?: number) {
    this.recordMetric({
      name: `blockchain_${operationName}`,
      value: duration,
      timestamp: Date.now(),
      category: 'blockchain',
      tags: {
        url: window.location.pathname,
        operation: operationName,
        success: success.toString(),
        chainId: chainId?.toString() || 'unknown'
      }
    });
  }

  // Track page navigation performance
  trackPageNavigation(fromPath: string, toPath: string, duration: number) {
    this.recordMetric({
      name: 'page_navigation',
      value: duration,
      timestamp: Date.now(),
      category: 'render',
      tags: {
        from: fromPath,
        to: toPath,
        navigationType: 'spa'
      }
    });
  }

  // Track component render performance
  trackComponentRender(componentName: string, renderTime: number, props?: Record<string, any>) {
    this.recordMetric({
      name: 'component_render',
      value: renderTime,
      timestamp: Date.now(),
      category: 'render',
      tags: {
        url: window.location.pathname,
        component: componentName,
        propsSize: props ? JSON.stringify(props).length.toString() : '0'
      }
    });
  }

  // Track API call performance
  trackAPICall(endpoint: string, method: string, duration: number, status: number, cached: boolean = false) {
    this.recordMetric({
      name: 'api_call',
      value: duration,
      timestamp: Date.now(),
      category: 'network',
      tags: {
        url: window.location.pathname,
        endpoint,
        method,
        status: status.toString(),
        cached: cached.toString()
      }
    });
  }

  // Get comprehensive page load metrics
  getPageLoadMetrics(): PageLoadMetrics | null {
    if (typeof window === 'undefined' || !performance.getEntriesByType) {
      return null;
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    const lcpEntry = this.metrics.find(m => m.name === 'largest_contentful_paint');
    const clsEntry = this.metrics.find(m => m.name === 'cumulative_layout_shift');
    const fidEntry = this.metrics.find(m => m.name === 'first_input_delay');

    const resources = performance.getEntriesByType('resource');

    return {
      firstContentfulPaint: fcp,
      largestContentfulPaint: lcpEntry?.value || 0,
      cumulativeLayoutShift: clsEntry?.value || 0,
      firstInputDelay: fidEntry?.value || 0,
      timeToInteractive: navigation.domInteractive - navigation.navigationStart,
      totalPageSize: resources.reduce((total, resource: any) => total + (resource.transferSize || 0), 0),
      loadTime: navigation.loadEventEnd - navigation.navigationStart,
      resourceCount: resources.length
    };
  }

  // Get performance summary
  getPerformanceSummary(timeWindow: number = 300000): {
    averageLoadTime: number;
    averageAPIResponseTime: number;
    averageBlockchainOpTime: number;
    errorRate: number;
    slowOperationsCount: number;
    cacheHitRate: number;
    totalMetrics: number;
  } {
    const cutoffTime = Date.now() - timeWindow;
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoffTime);

    const loadMetrics = recentMetrics.filter(m => m.category === 'load');
    const networkMetrics = recentMetrics.filter(m => m.category === 'network');
    const blockchainMetrics = recentMetrics.filter(m => m.category === 'blockchain');
    
    const apiCalls = networkMetrics.filter(m => m.name === 'api_call');
    const cachedCalls = apiCalls.filter(m => m.tags?.cached === 'true');
    const failedOps = recentMetrics.filter(m => 
      m.tags?.success === 'false' || 
      m.tags?.status?.startsWith('4') || 
      m.tags?.status?.startsWith('5')
    );
    const slowOps = recentMetrics.filter(m => m.value > 3000); // Operations > 3 seconds

    return {
      averageLoadTime: loadMetrics.length > 0 
        ? loadMetrics.reduce((sum, m) => sum + m.value, 0) / loadMetrics.length 
        : 0,
      averageAPIResponseTime: apiCalls.length > 0 
        ? apiCalls.reduce((sum, m) => sum + m.value, 0) / apiCalls.length 
        : 0,
      averageBlockchainOpTime: blockchainMetrics.length > 0 
        ? blockchainMetrics.reduce((sum, m) => sum + m.value, 0) / blockchainMetrics.length 
        : 0,
      errorRate: recentMetrics.length > 0 
        ? (failedOps.length / recentMetrics.length) * 100 
        : 0,
      slowOperationsCount: slowOps.length,
      cacheHitRate: apiCalls.length > 0 
        ? (cachedCalls.length / apiCalls.length) * 100 
        : 0,
      totalMetrics: recentMetrics.length
    };
  }

  // Get metrics for specific category
  getMetricsByCategory(category: PerformanceMetric['category'], limit: number = 100): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.category === category)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Export metrics for external analysis
  exportMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Clear old metrics
  clearMetrics(olderThan?: number) {
    if (olderThan) {
      this.metrics = this.metrics.filter(m => m.timestamp > olderThan);
    } else {
      this.metrics = [];
    }
  }

  // Record a custom metric
  private recordMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return;

    this.metrics.push(metric);

    // Ensure we don't exceed storage limits
    if (this.metrics.length > this.maxMetricsStorage) {
      this.metrics = this.metrics.slice(-this.maxMetricsStorage);
    }

    // Log performance issues
    if (metric.value > 5000) {
      console.warn(`🐌 Slow operation detected: ${metric.name} took ${metric.value}ms`);
    }
  }

  // Periodic cleanup of old metrics
  private startPeriodicCleanup() {
    setInterval(() => {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      this.clearMetrics(oneHourAgo);
    }, 300000); // Clean every 5 minutes
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Cleanup observers
  destroy() {
    for (const [name, observer] of this.observers) {
      observer.disconnect();
    }
    this.observers.clear();
    this.metrics = [];
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const trackRender = (componentName: string, renderTime: number, props?: any) => {
    performanceMonitor.trackComponentRender(componentName, renderTime, props);
  };

  const trackNavigation = (from: string, to: string, duration: number) => {
    performanceMonitor.trackPageNavigation(from, to, duration);
  };

  const trackAPI = (endpoint: string, method: string, duration: number, status: number, cached?: boolean) => {
    performanceMonitor.trackAPICall(endpoint, method, duration, status, cached);
  };

  const trackBlockchain = (operation: string, duration: number, success: boolean, chainId?: number) => {
    performanceMonitor.trackBlockchainOperation(operation, duration, success, chainId);
  };

  const getMetrics = () => performanceMonitor.getPerformanceSummary();
  const getPageMetrics = () => performanceMonitor.getPageLoadMetrics();

  return {
    trackRender,
    trackNavigation,
    trackAPI,
    trackBlockchain,
    getMetrics,
    getPageMetrics
  };
};

export default performanceMonitor;