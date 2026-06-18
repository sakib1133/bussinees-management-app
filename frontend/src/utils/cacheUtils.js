/**
 * PWA Cache Management Utilities
 * 
 * Provides utilities for managing application caches,
 * clearing stale data, and managing storage quota
 */

const CACHE_CONFIG = {
  CACHE_NAME: 'bms-v1',
  RUNTIME_CACHE: 'bms-runtime-v1',
  API_CACHE: 'bms-api-v1',
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  CACHE_EXPIRY_DAYS: 30,
};

/**
 * Get all cached URLs
 */
export async function getAllCachedUrls() {
  try {
    const cacheNames = await caches.keys();
    const allUrls = [];

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const requests = await cache.keys();
      
      for (const request of requests) {
        allUrls.push({
          url: request.url,
          cache: name,
        });
      }
    }

    return allUrls;
  } catch (error) {
    console.error('[Cache] Failed to get cached URLs:', error);
    return [];
  }
}

/**
 * Clear cache by name
 */
export async function clearCacheByName(cacheName) {
  try {
    const deleted = await caches.delete(cacheName);
    if (deleted) {
      console.log(`[Cache] Deleted cache: ${cacheName}`);
    }
    return deleted;
  } catch (error) {
    console.error(`[Cache] Failed to delete cache ${cacheName}:`, error);
    return false;
  }
}

/**
 * Clear old caches
 */
export async function clearOldCaches() {
  try {
    const cacheNames = await caches.keys();
    const whitelist = [
      CACHE_CONFIG.CACHE_NAME,
      CACHE_CONFIG.RUNTIME_CACHE,
      CACHE_CONFIG.API_CACHE,
    ];

    const deletePromises = cacheNames
      .filter(name => !whitelist.includes(name))
      .map(name => {
        console.log(`[Cache] Removing old cache: ${name}`);
        return caches.delete(name);
      });

    await Promise.all(deletePromises);
    console.log('[Cache] Old caches cleared');
  } catch (error) {
    console.error('[Cache] Failed to clear old caches:', error);
  }
}

/**
 * Get total cache size
 */
export async function getTotalCacheSize() {
  try {
    let totalSize = 0;
    const cacheNames = await caches.keys();

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const requests = await cache.keys();

      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return totalSize;
  } catch (error) {
    console.error('[Cache] Failed to get cache size:', error);
    return 0;
  }
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  try {
    const cacheNames = await caches.keys();
    const stats = {
      totalSize: 0,
      caches: {},
      count: 0,
    };

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const requests = await cache.keys();
      let cacheSize = 0;

      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          cacheSize += blob.size;
          stats.count++;
        }
      }

      stats.caches[name] = {
        size: cacheSize,
        entries: requests.length,
        sizeFormatted: formatBytes(cacheSize),
      };

      stats.totalSize += cacheSize;
    }

    stats.totalSizeFormatted = formatBytes(stats.totalSize);
    return stats;
  } catch (error) {
    console.error('[Cache] Failed to get cache stats:', error);
    return {
      totalSize: 0,
      caches: {},
      count: 0,
      totalSizeFormatted: '0 B',
    };
  }
}

/**
 * Clear cache for specific URL pattern
 */
export async function clearCacheByPattern(pattern) {
  try {
    const regex = new RegExp(pattern);
    const cacheNames = await caches.keys();
    let cleared = 0;

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const requests = await cache.keys();

      for (const request of requests) {
        if (regex.test(request.url)) {
          await cache.delete(request);
          cleared++;
          console.log(`[Cache] Deleted: ${request.url}`);
        }
      }
    }

    console.log(`[Cache] Cleared ${cleared} items matching pattern: ${pattern}`);
    return cleared;
  } catch (error) {
    console.error('[Cache] Failed to clear cache by pattern:', error);
    return 0;
  }
}

/**
 * Clear API cache
 */
export async function clearAPICache() {
  try {
    const cleared = await caches.delete(CACHE_CONFIG.API_CACHE);
    if (cleared) {
      console.log('[Cache] API cache cleared');
    }
    return cleared;
  } catch (error) {
    console.error('[Cache] Failed to clear API cache:', error);
    return false;
  }
}

/**
 * Clear runtime cache
 */
export async function clearRuntimeCache() {
  try {
    const cleared = await caches.delete(CACHE_CONFIG.RUNTIME_CACHE);
    if (cleared) {
      console.log('[Cache] Runtime cache cleared');
    }
    return cleared;
  } catch (error) {
    console.error('[Cache] Failed to clear runtime cache:', error);
    return false;
  }
}

/**
 * Prune cache if size exceeds limit
 */
export async function pruneCacheIfNeeded() {
  try {
    const totalSize = await getTotalCacheSize();

    if (totalSize > CACHE_CONFIG.MAX_CACHE_SIZE) {
      console.log(`[Cache] Cache size (${formatBytes(totalSize)}) exceeds limit (${formatBytes(CACHE_CONFIG.MAX_CACHE_SIZE)})`);
      
      // Clear API cache first as it can be repopulated
      await clearAPICache();
      
      // Clear old caches
      await clearOldCaches();
      
      const newSize = await getTotalCacheSize();
      console.log(`[Cache] Cache pruned. New size: ${formatBytes(newSize)}`);
      
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Cache] Failed to prune cache:', error);
    return false;
  }
}

/**
 * Check if URL is cached
 */
export async function isUrlCached(url) {
  try {
    const cacheNames = await caches.keys();

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const response = await cache.match(url);
      if (response) {
        return {
          cached: true,
          cache: name,
        };
      }
    }

    return { cached: false };
  } catch (error) {
    console.error('[Cache] Failed to check if URL is cached:', error);
    return { cached: false };
  }
}

/**
 * Pre-cache critical assets
 */
export async function preCacheCriticalAssets(urls) {
  try {
    const cache = await caches.open(CACHE_CONFIG.CACHE_NAME);
    
    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response.clone());
          console.log(`[Cache] Pre-cached: ${url}`);
        }
      } catch (error) {
        console.error(`[Cache] Failed to pre-cache ${url}:`, error);
      }
    }
  } catch (error) {
    console.error('[Cache] Failed to pre-cache critical assets:', error);
  }
}

/**
 * Get storage quota information
 */
export async function getStorageQuota() {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        percentage: Math.round((estimate.usage / estimate.quota) * 100),
        usageFormatted: formatBytes(estimate.usage),
        quotaFormatted: formatBytes(estimate.quota),
      };
    }
  } catch (error) {
    console.error('[Cache] Failed to get storage quota:', error);
  }

  return {
    usage: 0,
    quota: 0,
    percentage: 0,
    usageFormatted: '0 B',
    quotaFormatted: '0 B',
  };
}

/**
 * Initialize cache management
 */
export async function initializeCacheManagement() {
  try {
    console.log('[Cache] Initializing cache management');

    // Clear old caches
    await clearOldCaches();

    // Prune if necessary
    await pruneCacheIfNeeded();

    // Log cache stats
    const stats = await getCacheStats();
    console.log('[Cache] Current stats:', stats);

    // Get storage quota
    const quota = await getStorageQuota();
    console.log('[Cache] Storage quota:', quota);

    return { stats, quota };
  } catch (error) {
    console.error('[Cache] Failed to initialize cache management:', error);
    return null;
  }
}
