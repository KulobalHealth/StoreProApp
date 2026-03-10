/**
 * Performance monitoring and optimization utilities
 */

/**
 * Simple performance monitor
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.enabled = process.env.NODE_ENV === 'development'
  }

  /**
   * Start timing an operation
   */
  startTimer(label) {
    if (!this.enabled) return
    this.metrics.set(label, performance.now())
  }

  /**
   * End timing and log results
   */
  endTimer(label, logToConsole = true) {
    if (!this.enabled) return 0
    
    const startTime = this.metrics.get(label)
    if (!startTime) {
      console.warn(`No start time found for: ${label}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.metrics.delete(label)

    if (logToConsole) {
      const color = duration > 1000 ? 'red' : duration > 500 ? 'orange' : 'green'
      console.log(
        `%c⏱️ ${label}: ${duration.toFixed(2)}ms`,
        `color: ${color}; font-weight: bold;`
      )
    }

    return duration
  }

  /**
   * Measure function execution time
   */
  async measureAsync(label, fn) {
    this.startTimer(label)
    try {
      const result = await fn()
      this.endTimer(label)
      return result
    } catch (error) {
      this.endTimer(label)
      throw error
    }
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    return Array.from(this.metrics.entries()).map(([label, time]) => ({
      label,
      elapsed: performance.now() - time
    }))
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear()
  }
}

export const performanceMonitor = new PerformanceMonitor()

/**
 * Memory usage checker (if available)
 */
export const checkMemoryUsage = () => {
  if (performance.memory) {
    return {
      usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
      usage: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(2) + '%'
    }
  }
  return null
}

/**
 * Log memory usage
 */
export const logMemoryUsage = () => {
  const memory = checkMemoryUsage()
  if (memory) {
    console.log('📊 Memory Usage:', memory)
    
    // Warn if memory usage is high
    const usagePercent = parseFloat(memory.usage)
    if (usagePercent > 80) {
      console.warn('⚠️ High memory usage detected:', usagePercent + '%')
    }
  }
}

/**
 * FPS monitor for performance tracking
 */
class FPSMonitor {
  constructor() {
    this.fps = 0
    this.frames = 0
    this.lastTime = performance.now()
    this.isRunning = false
  }

  start() {
    if (this.isRunning) return
    this.isRunning = true
    this.tick()
  }

  tick() {
    if (!this.isRunning) return

    this.frames++
    const currentTime = performance.now()
    
    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime))
      this.frames = 0
      this.lastTime = currentTime

      if (this.fps < 30) {
        console.warn(`⚠️ Low FPS detected: ${this.fps} fps`)
      }
    }

    requestAnimationFrame(() => this.tick())
  }

  stop() {
    this.isRunning = false
  }

  getFPS() {
    return this.fps
  }
}

export const fpsMonitor = new FPSMonitor()

/**
 * Detect performance issues
 */
export const detectPerformanceIssues = () => {
  const issues = []

  // Check memory
  const memory = checkMemoryUsage()
  if (memory) {
    const usagePercent = parseFloat(memory.usage)
    if (usagePercent > 80) {
      issues.push({
        type: 'memory',
        severity: 'high',
        message: `High memory usage: ${memory.usage}`
      })
    }
  }

  // Check FPS
  const fps = fpsMonitor.getFPS()
  if (fps > 0 && fps < 30) {
    issues.push({
      type: 'fps',
      severity: 'medium',
      message: `Low frame rate: ${fps} fps`
    })
  }

  // Check localStorage usage
  try {
    const totalSize = Object.keys(localStorage).reduce((total, key) => {
      return total + localStorage.getItem(key).length
    }, 0)
    const sizeInMB = (totalSize / 1048576).toFixed(2)
    
    if (totalSize > 4 * 1024 * 1024) { // 4MB
      issues.push({
        type: 'storage',
        severity: 'medium',
        message: `High localStorage usage: ${sizeInMB} MB`
      })
    }
  } catch (error) {
    console.warn('Could not check localStorage usage:', error)
  }

  return issues
}

/**
 * Optimize data for storage
 */
export const optimizeForStorage = (data) => {
  try {
    // Remove unnecessary whitespace from JSON
    const jsonString = JSON.stringify(data)
    const compressed = jsonString.replace(/\s+/g, ' ')
    return compressed
  } catch (error) {
    console.error('Error optimizing data:', error)
    return JSON.stringify(data)
  }
}

/**
 * Batch operations for better performance
 */
export class BatchProcessor {
  constructor(batchSize = 10, delay = 100) {
    this.queue = []
    this.batchSize = batchSize
    this.delay = delay
    this.processing = false
  }

  add(item) {
    this.queue.push(item)
    if (!this.processing) {
      this.process()
    }
  }

  async process() {
    if (this.queue.length === 0) {
      this.processing = false
      return
    }

    this.processing = true
    const batch = this.queue.splice(0, this.batchSize)
    
    try {
      // Process batch
      await Promise.all(batch.map(item => item()))
    } catch (error) {
      console.error('Batch processing error:', error)
    }

    // Wait before processing next batch
    await new Promise(resolve => setTimeout(resolve, this.delay))
    this.process()
  }
}

/**
 * Request idle callback wrapper with fallback
 */
export const requestIdleCallback = (callback, options = {}) => {
  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    return window.requestIdleCallback(callback, options)
  }
  // Fallback to setTimeout
  return setTimeout(callback, 1)
}

/**
 * Cancel idle callback wrapper
 */
export const cancelIdleCallback = (id) => {
  if (typeof window !== 'undefined' && window.cancelIdleCallback) {
    window.cancelIdleCallback(id)
  } else {
    clearTimeout(id)
  }
}

export default {
  performanceMonitor,
  checkMemoryUsage,
  logMemoryUsage,
  fpsMonitor,
  detectPerformanceIssues,
  optimizeForStorage,
  BatchProcessor,
  requestIdleCallback,
  cancelIdleCallback
}
