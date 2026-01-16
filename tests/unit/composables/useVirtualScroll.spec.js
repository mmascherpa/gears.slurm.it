import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useVirtualScroll } from '@/composables/useVirtualScroll'

describe('useVirtualScroll', () => {
  let virtualScroll

  beforeEach(() => {
    virtualScroll = useVirtualScroll()
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(virtualScroll.scrollTop.value).toBe(0)
      expect(virtualScroll.viewportHeight.value).toBe(600)
      expect(virtualScroll.totalRows.value).toBe(0)
      expect(virtualScroll.scrollContainerRef.value).toBeNull()
    })

    it('should accept custom row height', () => {
      const customScroll = useVirtualScroll({ rowHeight: 32 })
      customScroll.updateTotalRows(100)

      expect(customScroll.totalHeight.value).toBe(3200) // 100 * 32
    })

    it('should accept custom overscan count', () => {
      const customScroll = useVirtualScroll({ overscanCount: 10 })
      customScroll.updateTotalRows(100)
      customScroll.updateViewportHeight(240)

      // With overscan of 10, should render more rows
      expect(customScroll.startIndex.value).toBe(0)
      expect(customScroll.endIndex.value).toBeGreaterThan(10)
    })
  })

  describe('totalHeight', () => {
    it('should calculate total height based on rows and row height', () => {
      virtualScroll.updateTotalRows(100)

      // Default row height is 24
      expect(virtualScroll.totalHeight.value).toBe(2400)
    })

    it('should return 0 when no rows', () => {
      expect(virtualScroll.totalHeight.value).toBe(0)
    })

    it('should update when total rows change', () => {
      virtualScroll.updateTotalRows(50)
      expect(virtualScroll.totalHeight.value).toBe(1200)

      virtualScroll.updateTotalRows(100)
      expect(virtualScroll.totalHeight.value).toBe(2400)
    })
  })

  describe('startIndex', () => {
    it('should return 0 when scrolled to top', () => {
      virtualScroll.updateTotalRows(100)
      virtualScroll.scrollTop.value = 0

      expect(virtualScroll.startIndex.value).toBe(0)
    })

    it('should calculate start index based on scroll position', () => {
      virtualScroll.updateTotalRows(100)
      virtualScroll.scrollTop.value = 240 // 10 rows down (24px each)

      // With overscan of 5, start should be 10 - 5 = 5
      expect(virtualScroll.startIndex.value).toBe(5)
    })

    it('should never go below 0', () => {
      virtualScroll.updateTotalRows(100)
      virtualScroll.scrollTop.value = 48 // 2 rows down

      // 2 - 5 = -3, but should be clamped to 0
      expect(virtualScroll.startIndex.value).toBe(0)
    })
  })

  describe('endIndex', () => {
    it('should calculate end index based on viewport and overscan', () => {
      virtualScroll.updateTotalRows(100)
      virtualScroll.updateViewportHeight(240) // 10 rows visible
      virtualScroll.scrollTop.value = 0

      // Start index = 0, visible = 10, overscan = 5
      // End = 0 + 10 + 5 + 5 = 20
      expect(virtualScroll.endIndex.value).toBe(20)
    })

    it('should not exceed total rows', () => {
      virtualScroll.updateTotalRows(10)
      virtualScroll.updateViewportHeight(600)
      virtualScroll.scrollTop.value = 0

      expect(virtualScroll.endIndex.value).toBeLessThanOrEqual(10)
    })
  })

  describe('visibleRowCount', () => {
    it('should calculate visible row count', () => {
      virtualScroll.updateTotalRows(100)
      virtualScroll.updateViewportHeight(240)
      virtualScroll.scrollTop.value = 0

      expect(virtualScroll.visibleRowCount.value).toBe(20) // endIndex - startIndex
    })

    it('should return correct count when scrolled', () => {
      virtualScroll.updateTotalRows(100)
      virtualScroll.updateViewportHeight(240)
      virtualScroll.scrollTop.value = 240

      const count = virtualScroll.visibleRowCount.value
      expect(count).toBeGreaterThan(0)
    })
  })

  describe('offsetY', () => {
    it('should return 0 when scrolled to top', () => {
      virtualScroll.updateTotalRows(100)
      virtualScroll.scrollTop.value = 0

      expect(virtualScroll.offsetY.value).toBe(0)
    })

    it('should calculate offset based on start index', () => {
      virtualScroll.updateTotalRows(100)
      virtualScroll.scrollTop.value = 480 // 20 rows down

      // Start index = 20 - 5 = 15
      // Offset = 15 * 24 = 360
      expect(virtualScroll.offsetY.value).toBe(360)
    })
  })

  describe('getScrollPercentage', () => {
    it('should return 0 when scrolled to top', () => {
      virtualScroll.updateTotalRows(100)
      virtualScroll.scrollTop.value = 0

      expect(virtualScroll.getScrollPercentage.value).toBe(0)
    })

    it('should return 100 when scrolled to bottom', () => {
      virtualScroll.updateTotalRows(100)
      virtualScroll.updateViewportHeight(240)
      // Total height = 2400, viewport = 240, max scroll = 2160
      virtualScroll.scrollTop.value = 2160

      expect(virtualScroll.getScrollPercentage.value).toBe(100)
    })

    it('should return 50 when scrolled to middle', () => {
      virtualScroll.updateTotalRows(100)
      virtualScroll.updateViewportHeight(240)
      // Max scroll = 2400 - 240 = 2160
      virtualScroll.scrollTop.value = 1080 // Half of 2160

      expect(virtualScroll.getScrollPercentage.value).toBe(50)
    })

    it('should return 0 when total height is 0', () => {
      virtualScroll.updateTotalRows(0)

      expect(virtualScroll.getScrollPercentage.value).toBe(0)
    })

    it('should return 0 when content fits in viewport', () => {
      virtualScroll.updateTotalRows(5) // 5 * 24 = 120px
      virtualScroll.updateViewportHeight(600)

      expect(virtualScroll.getScrollPercentage.value).toBe(0)
    })
  })

  describe('handleScroll', () => {
    it('should update scrollTop from event', () => {
      const mockEvent = { target: { scrollTop: 100 } }

      virtualScroll.handleScroll(mockEvent)

      expect(virtualScroll.scrollTop.value).toBe(100)
    })

    it('should handle scroll to 0', () => {
      virtualScroll.scrollTop.value = 100
      const mockEvent = { target: { scrollTop: 0 } }

      virtualScroll.handleScroll(mockEvent)

      expect(virtualScroll.scrollTop.value).toBe(0)
    })
  })

  describe('updateViewportHeight', () => {
    it('should update viewport height', () => {
      virtualScroll.updateViewportHeight(800)

      expect(virtualScroll.viewportHeight.value).toBe(800)
    })

    it('should affect visible row calculations', () => {
      virtualScroll.updateTotalRows(100)
      virtualScroll.updateViewportHeight(480) // 20 rows visible

      const endBefore = virtualScroll.endIndex.value

      virtualScroll.updateViewportHeight(240) // 10 rows visible

      expect(virtualScroll.endIndex.value).toBeLessThan(endBefore)
    })
  })

  describe('updateTotalRows', () => {
    it('should update total rows', () => {
      virtualScroll.updateTotalRows(50)

      expect(virtualScroll.totalRows.value).toBe(50)
    })

    it('should affect total height', () => {
      virtualScroll.updateTotalRows(100)

      expect(virtualScroll.totalHeight.value).toBe(2400)
    })
  })

  describe('scrollToRow', () => {
    it('should scroll to specific row', () => {
      const mockContainer = {
        scrollTo: vi.fn()
      }
      virtualScroll.scrollContainerRef.value = mockContainer
      virtualScroll.updateTotalRows(100)

      virtualScroll.scrollToRow(10)

      expect(mockContainer.scrollTo).toHaveBeenCalledWith({
        top: 240, // 10 * 24
        behavior: 'smooth'
      })
    })

    it('should accept behavior parameter', () => {
      const mockContainer = {
        scrollTo: vi.fn()
      }
      virtualScroll.scrollContainerRef.value = mockContainer
      virtualScroll.updateTotalRows(100)

      virtualScroll.scrollToRow(10, 'auto')

      expect(mockContainer.scrollTo).toHaveBeenCalledWith({
        top: 240,
        behavior: 'auto'
      })
    })

    it('should not throw when container ref is null', () => {
      virtualScroll.scrollContainerRef.value = null

      expect(() => virtualScroll.scrollToRow(10)).not.toThrow()
    })
  })

  describe('scrollToOffset', () => {
    it('should scroll to byte offset', () => {
      const mockContainer = {
        scrollTo: vi.fn()
      }
      virtualScroll.scrollContainerRef.value = mockContainer
      virtualScroll.updateTotalRows(100)

      // Byte offset 160, bytesPerRow 16 => row 10
      virtualScroll.scrollToOffset(160)

      expect(mockContainer.scrollTo).toHaveBeenCalledWith({
        top: 240, // row 10 * 24
        behavior: 'smooth'
      })
    })

    it('should accept custom bytesPerRow', () => {
      const mockContainer = {
        scrollTo: vi.fn()
      }
      virtualScroll.scrollContainerRef.value = mockContainer
      virtualScroll.updateTotalRows(100)

      // Byte offset 320, bytesPerRow 32 => row 10
      virtualScroll.scrollToOffset(320, 32)

      expect(mockContainer.scrollTo).toHaveBeenCalledWith({
        top: 240,
        behavior: 'smooth'
      })
    })
  })

  describe('resetScroll', () => {
    it('should reset scroll position to top', () => {
      const mockContainer = {
        scrollTop: 500
      }
      virtualScroll.scrollContainerRef.value = mockContainer
      virtualScroll.scrollTop.value = 500

      virtualScroll.resetScroll()

      expect(mockContainer.scrollTop).toBe(0)
      expect(virtualScroll.scrollTop.value).toBe(0)
    })

    it('should not throw when container ref is null', () => {
      virtualScroll.scrollContainerRef.value = null
      virtualScroll.scrollTop.value = 100

      expect(() => virtualScroll.resetScroll()).not.toThrow()
      expect(virtualScroll.scrollTop.value).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle very large datasets', () => {
      virtualScroll.updateTotalRows(1000000)
      virtualScroll.updateViewportHeight(600)

      expect(virtualScroll.totalHeight.value).toBe(24000000)
      expect(virtualScroll.startIndex.value).toBe(0)
      expect(virtualScroll.endIndex.value).toBeGreaterThan(0)
      expect(virtualScroll.endIndex.value).toBeLessThan(1000000)
    })

    it('should handle single row', () => {
      virtualScroll.updateTotalRows(1)
      virtualScroll.updateViewportHeight(600)

      expect(virtualScroll.totalHeight.value).toBe(24)
      expect(virtualScroll.startIndex.value).toBe(0)
      expect(virtualScroll.endIndex.value).toBe(1)
    })

    it('should handle zero viewport height', () => {
      virtualScroll.updateTotalRows(100)
      virtualScroll.updateViewportHeight(0)

      expect(virtualScroll.visibleRowCount.value).toBeGreaterThanOrEqual(0)
    })
  })
})
