// Performance Testing Utilities
// Provides utilities for testing component performance and optimization

import { vi } from 'vitest'

// Performance measurement utilities
export const performanceTestUtils = {
  // Measure component render time
  measureRenderTime: async (renderFunction) => {
    const startTime = performance.now()
    const result = await renderFunction()
    const endTime = performance.now()
    
    return {
      renderTime: endTime - startTime,
      result,
    }
  },

  // Measure multiple renders for average performance
  measureAverageRenderTime: async (renderFunction, iterations = 10) => {
    const times = []
    
    for (let i = 0; i < iterations; i++) {
      const { renderTime } = await performanceTestUtils.measureRenderTime(renderFunction)
      times.push(renderTime)
    }
    
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)
    
    return {
      averageTime,
      minTime,
      maxTime,
      allTimes: times,
    }
  },

  // Test component with large datasets
  testLargeDatasetPerformance: async (Component, dataSize = 1000) => {
    const largeDataset = Array.from({ length: dataSize }, (_, index) => ({
      id: index,
      name: `Item ${index}`,
      description: `Description for item ${index}`,
      price: (Math.random() * 100).toFixed(2),
      image: `/images/item-${index}.jpg`,
    }))
    
    const { renderTime } = await performanceTestUtils.measureRenderTime(() => {
      return render(<Component data={largeDataset} />)
    })
    
    return {
      renderTime,
      dataSize,
      itemsPerMs: dataSize / renderTime,
    }
  },

  // Test virtual scrolling performance
  testVirtualScrolling: async (Component, totalItems = 10000, visibleItems = 50) => {
    const { renderTime } = await performanceTestUtils.measureRenderTime(() => {
      return render(
        <Component 
          totalItems={totalItems}
          visibleItems={visibleItems}
          itemHeight={50}
        />
      )
    })
    
    // Virtual scrolling should render only visible items regardless of total
    const renderedItems = screen.getAllByTestId(/item-/)
    expect(renderedItems.length).toBeLessThanOrEqual(visibleItems + 10) // Buffer
    
    return {
      renderTime,
      totalItems,
      visibleItems,
      actualRendered: renderedItems.length,
      efficiency: visibleItems / renderedItems.length,
    }
  },

  // Test lazy loading performance
  testLazyLoading: async (Component, itemCount = 100) => {
    const mockIntersectionObserver = vi.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })
    
    window.IntersectionObserver = mockIntersectionObserver
    
    const { renderTime } = await performanceTestUtils.measureRenderTime(() => {
      return render(<Component itemCount={itemCount} lazyLoad={true} />)
    })
    
    // Initially should only render items in viewport
    const initialItems = screen.getAllByTestId(/item-/)
    const lazyItems = screen.getAllByTestId(/lazy-placeholder/)
    
    return {
      renderTime,
      totalItems: itemCount,
      initiallyRendered: initialItems.length,
      lazyPlaceholders: lazyItems.length,
      lazyRatio: lazyItems.length / itemCount,
    }
  },

  // Test memory usage patterns
  testMemoryUsage: async (Component, operations = []) => {
    // Mock performance.memory (Chrome-specific)
    const mockMemory = {
      usedJSHeapSize: 10000000,
      totalJSHeapSize: 15000000,
      jsHeapSizeLimit: 100000000,
    }
    
    Object.defineProperty(performance, 'memory', {
      get: () => mockMemory,
    })
    
    const memorySnapshots = []
    
    // Initial render
    const component = render(<Component />)
    memorySnapshots.push({
      stage: 'initial',
      memory: { ...performance.memory },
    })
    
    // Execute operations
    for (const operation of operations) {
      await operation(component)
      memorySnapshots.push({
        stage: operation.name || 'operation',
        memory: { ...performance.memory },
      })
      
      // Simulate memory change
      mockMemory.usedJSHeapSize += Math.random() * 1000000
    }
    
    // Cleanup
    component.unmount()
    memorySnapshots.push({
      stage: 'cleanup',
      memory: { ...performance.memory },
    })
    
    return memorySnapshots
  },

  // Test component re-render frequency
  testReRenderFrequency: async (Component, interactions = []) => {
    let renderCount = 0
    
    const TrackingWrapper = ({ children }) => {
      React.useEffect(() => {
        renderCount++
      })
      
      return children
    }
    
    const { rerender } = render(
      <TrackingWrapper>
        <Component />
      </TrackingWrapper>
    )
    
    const initialRenderCount = renderCount
    
    // Execute interactions
    for (const interaction of interactions) {
      await interaction(rerender)
    }
    
    const finalRenderCount = renderCount
    
    return {
      initialRenders: initialRenderCount,
      finalRenders: finalRenderCount,
      additionalRenders: finalRenderCount - initialRenderCount,
      interactionCount: interactions.length,
      rendersPerInteraction: (finalRenderCount - initialRenderCount) / interactions.length,
    }
  },

  // Test async loading performance
  testAsyncLoadingPerformance: async (Component, asyncDataLoader) => {
    const loadingStartTime = performance.now()
    
    render(<Component dataLoader={asyncDataLoader} />)
    
    // Wait for loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument()
    const loadingDisplayTime = performance.now()
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })
    
    const loadingCompleteTime = performance.now()
    
    return {
      timeToShowLoading: loadingDisplayTime - loadingStartTime,
      totalLoadingTime: loadingCompleteTime - loadingStartTime,
      actualDataLoadTime: loadingCompleteTime - loadingDisplayTime,
    }
  },

  // Test image loading performance
  testImageLoadingPerformance: async (Component, imageCount = 20) => {
    const imageLoadTimes = []
    let loadedImages = 0
    
    // Mock image loading
    const originalImage = window.Image
    window.Image = class MockImage {
      constructor() {
        const startTime = performance.now()
        
        setTimeout(() => {
          const endTime = performance.now()
          imageLoadTimes.push(endTime - startTime)
          loadedImages++
          
          if (this.onload) this.onload()
        }, Math.random() * 1000) // Random load time
      }
    }
    
    const startTime = performance.now()
    render(<Component imageCount={imageCount} />)
    
    // Wait for all images to load
    await waitFor(() => {
      expect(loadedImages).toBe(imageCount)
    }, { timeout: 5000 })
    
    const totalTime = performance.now() - startTime
    
    // Restore original Image
    window.Image = originalImage
    
    return {
      totalLoadTime: totalTime,
      averageImageLoadTime: imageLoadTimes.reduce((sum, time) => sum + time, 0) / imageLoadTimes.length,
      fastestImageLoad: Math.min(...imageLoadTimes),
      slowestImageLoad: Math.max(...imageLoadTimes),
      allImageLoadTimes: imageLoadTimes,
    }
  },

  // Test scroll performance
  testScrollPerformance: async (Component, scrollDistance = 1000) => {
    const container = render(<Component />).container
    const scrollElement = container.querySelector('[data-testid="scroll-container"]')
    
    expect(scrollElement).toBeInTheDocument()
    
    const startTime = performance.now()
    let frameCount = 0
    
    // Mock requestAnimationFrame to count frames
    const originalRAF = window.requestAnimationFrame
    window.requestAnimationFrame = (callback) => {
      frameCount++
      return originalRAF(callback)
    }
    
    // Simulate smooth scroll
    fireEvent.scroll(scrollElement, { target: { scrollTop: scrollDistance } })
    
    // Wait for scroll to complete
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const endTime = performance.now()
    const totalTime = endTime - startTime
    
    // Restore original RAF
    window.requestAnimationFrame = originalRAF
    
    return {
      scrollTime: totalTime,
      frameCount,
      fps: frameCount / (totalTime / 1000),
      scrollDistance,
    }
  },

  // Test cart performance with multiple items
  testCartPerformance: async (CartComponent, itemCount = 50) => {
    const items = Array.from({ length: itemCount }, (_, index) => ({
      id: index,
      name: `Product ${index}`,
      price: 19.99,
      quantity: 1,
      image: `/images/product-${index}.jpg`,
    }))
    
    const { renderTime } = await performanceTestUtils.measureRenderTime(() => {
      return render(<CartComponent items={items} />)
    })
    
    // Test cart operations performance
    const addItemTime = await performanceTestUtils.measureRenderTime(async () => {
      const addButton = screen.getByTestId('add-item-button')
      await userEvent.click(addButton)
    })
    
    const removeItemTime = await performanceTestUtils.measureRenderTime(async () => {
      const removeButton = screen.getByTestId('remove-item-button')
      await userEvent.click(removeButton)
    })
    
    const updateQuantityTime = await performanceTestUtils.measureRenderTime(async () => {
      const quantityInput = screen.getByTestId('quantity-input')
      await userEvent.clear(quantityInput)
      await userEvent.type(quantityInput, '5')
    })
    
    return {
      initialRenderTime: renderTime,
      itemCount,
      addItemTime: addItemTime.renderTime,
      removeItemTime: removeItemTime.renderTime,
      updateQuantityTime: updateQuantityTime.renderTime,
      averageOperationTime: (addItemTime.renderTime + removeItemTime.renderTime + updateQuantityTime.renderTime) / 3,
    }
  },

  // Test component bundle size impact
  testBundleSize: (componentName, bundleInfo) => {
    // This would normally integrate with webpack-bundle-analyzer or similar
    const componentSize = bundleInfo.components?.[componentName] || 0
    const totalSize = bundleInfo.total || 0
    const percentage = (componentSize / totalSize) * 100
    
    return {
      componentSize,
      totalSize,
      percentage,
      isOptimal: percentage < 5, // Arbitrary threshold
    }
  },

  // Performance benchmarking
  benchmark: async (testName, testFunction, iterations = 5) => {
    const results = []
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now()
      await testFunction()
      const endTime = performance.now()
      results.push(endTime - startTime)
    }
    
    const average = results.reduce((sum, time) => sum + time, 0) / results.length
    const min = Math.min(...results)
    const max = Math.max(...results)
    const standardDeviation = Math.sqrt(
      results.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / results.length
    )
    
    return {
      testName,
      iterations,
      average,
      min,
      max,
      standardDeviation,
      results,
    }
  },

  // Assert performance thresholds
  assertPerformance: (metrics, thresholds) => {
    Object.entries(thresholds).forEach(([metric, threshold]) => {
      const value = metrics[metric]
      
      if (typeof threshold === 'object') {
        if (threshold.max !== undefined) {
          expect(value).toBeLessThanOrEqual(threshold.max)
        }
        if (threshold.min !== undefined) {
          expect(value).toBeGreaterThanOrEqual(threshold.min)
        }
      } else {
        expect(value).toBeLessThanOrEqual(threshold)
      }
    })
  },
}

// Performance thresholds for different scenarios
export const performanceThresholds = {
  componentRender: {
    small: 50, // ms
    medium: 100,
    large: 200,
  },
  cartOperations: {
    addItem: 100,
    removeItem: 50,
    updateQuantity: 75,
    checkout: 500,
  },
  dataLoading: {
    initial: 1000,
    subsequent: 500,
    cached: 100,
  },
  scrolling: {
    minFps: 30,
    targetFps: 60,
  },
  memoryUsage: {
    maxIncrease: 10000000, // bytes
    maxTotal: 50000000,
  },
}

export default performanceTestUtils
