interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
  version: string;
  size: number;
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  maxEntries: number;
  enableCompression: boolean;
  enableEncryption: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  currentSize: number;
  currentEntries: number;
  hitRate: number;
  storageUsage: number;
}

class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    currentSize: 0,
    currentEntries: 0,
    hitRate: 0,
    storageUsage: 0
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 300000, // 5 minutes
      maxSize: 50 * 1024 * 1024, // 50MB
      maxEntries: 1000,
      enableCompression: true,
      enableEncryption: false,
      ...config
    };

    // Initialize with any existing localStorage cache
    this.loadFromStorage();
    
    // Periodic cleanup
    setInterval(() => this.cleanup(), 60000); // Every minute
    
    // Save cache to storage before page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.saveToStorage());
    }
  }

  // Get item from cache
  async get<T>(key: string, fetchFunction?: () => Promise<T>, ttl?: number): Promise<T | null> {
    const entry = this.cache.get(key);
    const now = Date.now();

    // Check if entry exists and is not expired
    if (entry && now - entry.timestamp < entry.ttl) {
      this.stats.hits++;
      this.updateStats();
      
      // Return decompressed/decrypted data
      return this.deserializeData<T>(entry.data);
    }

    this.stats.misses++;
    this.updateStats();

    // If no fetch function provided, return null
    if (!fetchFunction) {
      return null;
    }

    // Fetch fresh data
    try {
      const freshData = await fetchFunction();
      await this.set(key, freshData, ttl);
      return freshData;
    } catch (error) {
      console.error(`Error fetching data for cache key ${key}:`, error);
      
      // Return stale data if available
      if (entry) {
        console.warn(`Returning stale data for cache key ${key}`);
        return this.deserializeData<T>(entry.data);
      }
      
      throw error;
    }
  }

  // Set item in cache
  async set<T>(key: string, data: T, ttl?: number, etag?: string): Promise<void> {
    const actualTTL = ttl || this.config.defaultTTL;
    const serializedData = await this.serializeData(data);
    const size = this.calculateSize(serializedData);

    // Check if we need to make space
    if (this.stats.currentSize + size > this.config.maxSize ||
        this.cache.size >= this.config.maxEntries) {
      this.evictLRU(size);
    }

    // Remove old entry if exists
    const oldEntry = this.cache.get(key);
    if (oldEntry) {
      this.stats.currentSize -= oldEntry.size;
    }

    // Add new entry
    const entry: CacheEntry<T> = {
      data: serializedData,
      timestamp: Date.now(),
      ttl: actualTTL,
      etag,
      version: '1.0',
      size
    };

    this.cache.set(key, entry);
    this.stats.currentSize += size;
    this.stats.currentEntries = this.cache.size;
    this.updateStats();
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    const isExpired = now - entry.timestamp >= entry.ttl;
    
    if (isExpired) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  // Delete specific key
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.stats.currentSize -= entry.size;
      this.stats.currentEntries--;
      this.updateStats();
    }
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.stats.currentSize = 0;
    this.stats.currentEntries = 0;
    this.updateStats();
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Preload data for anticipated requests
  async preload(preloadMap: Map<string, () => Promise<any>>): Promise<void> {
    const promises = Array.from(preloadMap.entries()).map(async ([key, fetchFn]) => {
      try {
        if (!this.has(key)) {
          const data = await fetchFn();
          await this.set(key, data);
          console.log(`✅ Preloaded cache for: ${key}`);
        }
      } catch (error) {
        console.error(`❌ Failed to preload cache for ${key}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  // Invalidate cache entries by pattern
  invalidatePattern(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let invalidated = 0;

    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (regex.test(key)) {
        this.delete(key);
        invalidated++;
      }
    }

    console.log(`🗑️ Invalidated ${invalidated} cache entries matching pattern: ${pattern}`);
    return invalidated;
  }

  // Refresh specific cache entry
  async refresh<T>(key: string, fetchFunction: () => Promise<T>, ttl?: number): Promise<T> {
    this.delete(key);
    const freshData = await fetchFunction();
    await this.set(key, freshData, ttl);
    return freshData;
  }

  // Batch operations
  async getBatch(keys: string[]): Promise<Map<string, any>> {
    const results = new Map();
    
    for (const key of keys) {
      const value = await this.get(key);
      if (value !== null) {
        results.set(key, value);
      }
    }
    
    return results;
  }

  async setBatch(entries: Map<string, { data: any; ttl?: number; etag?: string }>): Promise<void> {
    const promises = Array.from(entries.entries()).map(([key, { data, ttl, etag }]) =>
      this.set(key, data, ttl, etag)
    );
    
    await Promise.all(promises);
  }

  // Cache warming for critical application data
  async warmCache(): Promise<void> {
    const warmupTasks = new Map([
      ['user-profile', async () => {
        // Fetch user profile data
        const response = await fetch('/api/auth/profile', {
          credentials: 'include'
        });
        return response.ok ? response.json() : null;
      }],
      ['opportunities-list', async () => {
        // Fetch opportunities list
        const response = await fetch('/api/opportunities?limit=10');
        return response.ok ? response.json() : null;
      }],
      ['network-configs', async () => {
        // Fetch blockchain network configurations
        return {
          ethereum: { chainId: 1, name: 'Ethereum Mainnet' },
          polygon: { chainId: 137, name: 'Polygon' },
          goerli: { chainId: 5, name: 'Goerli Testnet' },
          mumbai: { chainId: 80001, name: 'Mumbai Testnet' }
        };
      }]
    ]);

    console.log('🔥 Warming up cache...');
    await this.preload(warmupTasks);
  }

  // Serialize data for storage (with optional compression)
  private async serializeData<T>(data: T): Promise<any> {
    let serialized: any = data;
    
    if (this.config.enableCompression && typeof data === 'object') {
      // Simple compression for demo - in production, use a proper compression library
      serialized = JSON.stringify(data);
      
      // In production, use compression like:
      // const compressed = await compress(JSON.stringify(data));
      // serialized = compressed;
    }

    if (this.config.enableEncryption) {
      // Encrypt sensitive data if needed
      // serialized = await encrypt(serialized);
    }

    return serialized;
  }

  // Deserialize data from storage
  private deserializeData<T>(data: any): T {
    let deserialized = data;
    
    if (this.config.enableEncryption) {
      // Decrypt if needed
      // deserialized = await decrypt(data);
    }

    if (this.config.enableCompression && typeof data === 'string') {
      try {
        deserialized = JSON.parse(data);
      } catch (error) {
        console.error('Error parsing compressed data:', error);
        return data as T;
      }
    }

    return deserialized as T;
  }

  // Calculate size of cached data
  private calculateSize(data: any): number {
    if (typeof data === 'string') {
      return data.length * 2; // 2 bytes per character for UTF-16
    }
    
    return JSON.stringify(data).length * 2;
  }

  // Least Recently Used (LRU) eviction
  private evictLRU(requiredSpace: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    let freedSpace = 0;
    let evicted = 0;

    for (const [key, entry] of entries) {
      if (freedSpace >= requiredSpace && this.cache.size < this.config.maxEntries) {
        break;
      }

      this.cache.delete(key);
      freedSpace += entry.size;
      evicted++;
    }

    this.stats.evictions += evicted;
    this.stats.currentSize -= freedSpace;
    this.stats.currentEntries = this.cache.size;

    console.log(`🗑️ Evicted ${evicted} cache entries, freed ${(freedSpace / 1024).toFixed(2)}KB`);
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    let freedSpace = 0;

    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(key);
        cleaned++;
        freedSpace += entry.size;
      }
    }

    if (cleaned > 0) {
      this.stats.currentSize -= freedSpace;
      this.stats.currentEntries = this.cache.size;
      console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
    }
  }

  // Update cache statistics
  private updateStats(): void {
    const totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    this.stats.storageUsage = (this.stats.currentSize / this.config.maxSize) * 100;
  }

  // Load cache from localStorage on initialization
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('app-cache');
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        
        for (const [key, entry] of Object.entries(data)) {
          const cacheEntry = entry as CacheEntry;
          
          // Only load non-expired entries
          if (now - cacheEntry.timestamp < cacheEntry.ttl) {
            this.cache.set(key, cacheEntry);
            this.stats.currentSize += cacheEntry.size;
          }
        }
        
        this.stats.currentEntries = this.cache.size;
        console.log(`📦 Loaded ${this.cache.size} cache entries from storage`);
      }
    } catch (error) {
      console.error('Error loading cache from storage:', error);
    }
  }

  // Save cache to localStorage
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const serializable = Object.fromEntries(this.cache.entries());
      localStorage.setItem('app-cache', JSON.stringify(serializable));
      console.log(`💾 Saved ${this.cache.size} cache entries to storage`);
    } catch (error) {
      console.error('Error saving cache to storage:', error);
      
      // Clear storage if quota exceeded
      if (error.name === 'QuotaExceededError') {
        localStorage.removeItem('app-cache');
        console.warn('🚨 Cache storage quota exceeded, cleared localStorage cache');
      }
    }
  }
}

// Create singleton instance
const cacheService = new CacheService({
  defaultTTL: 300000, // 5 minutes
  maxSize: 25 * 1024 * 1024, // 25MB
  maxEntries: 500,
  enableCompression: true,
  enableEncryption: false
});

// Initialize cache warming
if (typeof window !== 'undefined') {
  // Warm cache after initial page load
  setTimeout(() => {
    cacheService.warmCache().catch(console.error);
  }, 2000);
}

export default cacheService;