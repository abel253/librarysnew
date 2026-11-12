// app/stores/library.ts
import { defineStore } from 'pinia'

export interface LibraryItem {
  item_id: number
  title: string
  author: string
  isbn?: string
  call_number?: string
  publisher?: string
  publication_year?: number | string
  edition?: string
  shelf_number?: string
  sub_shelf_number?: string
  subject_category?: string
  location?: string
  effective_location?: string
  barcode?: string
  quantity?: number
  available_quantity?: number
  total_copies: number
  available_copies: number
  is_available: boolean
  item_type?: string
  status?: string
  shelf_type?: 'OPEN' | 'CLOSED'
  effective_shelf_type?: 'OPEN' | 'CLOSED'
  [key: string]: any
}

interface GuestInfo {
  name?: string
  phone?: string | null
  studentId?: string | null
  loanType?: 'SHORT' | 'LONG'
  durationDays?: number
  borrowScope?: 'INSIDE' | 'OUTSIDE'
}

// ── Helper: Normalize raw API data ──
function normalizeItem(raw: any): LibraryItem {
  const total = Number(raw.total_copies ?? raw.quantity ?? raw.total_quantity ?? 1)
  const available = Number(raw.available_copies ?? raw.available_quantity ?? raw.availableQuantity ?? total)
  const status = String(raw.status ?? 'AVAILABLE').toUpperCase()

  // ── shelf_type ን በትክክል አንብብ ──
  const rawShelfType = String(raw.shelf_type ?? '').trim().toUpperCase()
  const shelfType: 'OPEN' | 'CLOSED' = rawShelfType === 'CLOSED' ? 'CLOSED' : 'OPEN'

  return {
    ...raw,
    item_id: Number(raw.item_id ?? raw.id ?? 0),
    title: String(raw.title ?? ''),
    author: String(raw.author ?? ''),
    isbn: String(raw.isbn ?? ''),
    call_number: String(raw.call_number ?? ''),
    location: String(raw.location ?? '').trim(),
    shelf_number: String(raw.shelf_number ?? '').trim(),
    sub_shelf_number: String(raw.sub_shelf_number ?? 'N/A').trim(),
    shelf_type: shelfType,
    effective_shelf_type: shelfType,
    total_copies: total,
    available_copies: available,
    quantity: total,
    available_quantity: available,
    is_available:
      available > 0 &&
      status !== 'UNAVAILABLE' &&
      status !== 'LOST' &&
      status !== 'BORROWED' &&
      status !== 'WITHDRAWN',
  }
}

function extractItems(response: any): any[] {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.items)) return response.items
  if (Array.isArray(response?.results)) return response.results
  if (Array.isArray(response?.data?.items)) return response.data.items
  return []
}

export const useLibraryStore = defineStore('library', {
  state: () => ({
    // Shared Central Reference Cache (የተጋራ ማከማቻ - ዳታቤዝ እንዳይጨናነቅ)
    cachedBooks: [] as LibraryItem[],
    isCacheLoaded: false,
    lastFetched: null as number | null,
    cacheTTL: 10 * 60 * 1000, // 10 minutes cache validity

    // Active Search / View Results
    searchResults: [] as LibraryItem[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    availableCount: (state): number =>
      state.searchResults.filter((item) => item.is_available).length,

    totalCount: (state): number =>
      state.searchResults.length,

    allCachedCount: (state): number =>
      state.cachedBooks.length,
  },

  actions: {
    /**
     * 1. ሼርድ ሪፈረንስን አንድ ጊዜ ብቻ ከዳታቤዝ መጫን (Fetch once into Shared Reference)
     * ቀጣይ ፍለጋዎች ዳታቤዝ ሳይጠይቁ ከዚህ ሪፈረንስ ብቻ ይሰራል
     */
    async fetchSharedCatalog(force = false): Promise<LibraryItem[]> {
      const isFresh = this.lastFetched && (Date.now() - this.lastFetched < this.cacheTTL)

      if (!force && this.isCacheLoaded && isFresh && this.cachedBooks.length > 0) {
        return this.cachedBooks
      }

      this.loading = true
      this.error = null

      try {
        const response: any = await $fetch('/api/items', {
          params: { limit: 10000 },
        })

        const items = extractItems(response)
        this.cachedBooks = items.map(normalizeItem)
        this.isCacheLoaded = true
        this.lastFetched = Date.now()
        
        if (this.searchResults.length === 0) {
          this.searchResults = [...this.cachedBooks]
        }

        return this.cachedBooks
      } catch (error: any) {
        this.error = error?.data?.message || error?.message || 'Failed to load catalog'
        if (this.cachedBooks.length > 0) return this.cachedBooks
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 2. ከተጋራው ሪፈረንስ ላይ ፈጣን ፍለጋ ማድረግ (Instant In-Memory Search without DB Strain)
     */
    async searchBooks(q = '', type = 'title', forceRemote = false): Promise<LibraryItem[]> {
      this.loading = true
      this.error = null

      try {
        // Ensure shared reference is loaded
        if (!this.isCacheLoaded || this.cachedBooks.length === 0) {
          await this.fetchSharedCatalog()
        }

        const term = q.trim().toLowerCase()

        // If no search term, return all cached reference items immediately
        if (!term) {
          this.searchResults = [...this.cachedBooks]
          return this.searchResults
        }

        // If not forcing remote, filter in-memory with zero DB strain!
        if (!forceRemote && this.cachedBooks.length > 0) {
          this.searchResults = this.cachedBooks.filter((item) => {
            if (type === 'title') {
              return item.title.toLowerCase().includes(term)
            }
            if (type === 'author') {
              return item.author.toLowerCase().includes(term)
            }
            if (type === 'isbn') {
              return item.isbn ? item.isbn.toLowerCase().includes(term) : false
            }
            if (type === 'call_number') {
              return item.call_number ? item.call_number.toLowerCase().includes(term) : false
            }

            // General search across all fields
            return (
              item.title.toLowerCase().includes(term) ||
              item.author.toLowerCase().includes(term) ||
              (item.isbn && item.isbn.toLowerCase().includes(term)) ||
              (item.call_number && item.call_number.toLowerCase().includes(term)) ||
              (item.shelf_number && item.shelf_number.toLowerCase().includes(term)) ||
              (item.subject_category && item.subject_category.toLowerCase().includes(term))
            )
          })

          return this.searchResults
        }

        // Fallback: If remote search explicitly requested
        const response: any = await $fetch('/api/items/search', {
          params: { q: term, type, limit: 10000 },
        })

        const items = extractItems(response)
        this.searchResults = items.map(normalizeItem)
        return this.searchResults
      } catch (error: any) {
        this.error = error?.data?.message || error?.message || 'Search execution failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 3. መጽሐፍ መጠየቅ / መውሰድ እና በሼርድ ሪፈረንስ ውስጥ In-Place ማዘመን
     */
    async requestBook(itemId: number, guest?: GuestInfo) {
      try {
        const response: any = await $fetch('/api/requests', {
          method: 'POST',
          body: {
            itemId,
            guestName: guest?.name || 'Student Borrower',
            guestPhone: guest?.phone || null,
            studentId: guest?.studentId || null,
            loanType: guest?.loanType || 'LONG',
            durationDays: guest?.durationDays || 14,
            borrowScope: guest?.borrowScope || 'OUTSIDE',
          },
        })

        // Update in-place in shared reference cache
        const targetCached = this.cachedBooks.find((entry) => entry.item_id === itemId)
        if (targetCached) {
          targetCached.available_copies = Math.max(0, targetCached.available_copies - 1)
          targetCached.available_quantity = targetCached.available_copies
          targetCached.is_available = targetCached.available_copies > 0
        }

        const targetSearch = this.searchResults.find((entry) => entry.item_id === itemId)
        if (targetSearch) {
          targetSearch.available_copies = Math.max(0, targetSearch.available_copies - 1)
          targetSearch.available_quantity = targetSearch.available_copies
          targetSearch.is_available = targetSearch.available_copies > 0
        }

        return response
      } catch (error: any) {
        const message = error?.data?.message || error?.message || 'Request failed'
        throw new Error(message)
      }
    },

    /**
     * Cache Invalidation & Mutations
     */
    addItemToSharedCache(item: any) {
      const normalized = normalizeItem(item)
      this.cachedBooks.unshift(normalized)
      this.searchResults.unshift(normalized)
    },

    updateItemInSharedCache(itemId: number, data: any) {
      const idx = this.cachedBooks.findIndex((b) => b.item_id === itemId)
      if (idx !== -1) {
        this.cachedBooks[idx] = normalizeItem({ ...this.cachedBooks[idx], ...data })
      }
      const sIdx = this.searchResults.findIndex((b) => b.item_id === itemId)
      if (sIdx !== -1) {
        this.searchResults[sIdx] = normalizeItem({ ...this.searchResults[sIdx], ...data })
      }
    },

    removeItemFromSharedCache(itemId: number) {
      this.cachedBooks = this.cachedBooks.filter((b) => b.item_id !== itemId)
      this.searchResults = this.searchResults.filter((b) => b.item_id !== itemId)
    },

    invalidateSharedCache() {
      this.isCacheLoaded = false
      this.lastFetched = null
    },
  },
})
