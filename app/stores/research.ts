// stores/research.ts
import { defineStore } from 'pinia'

export interface ResearchItem {
  id: number
  title: string
  authorName?: string
  college: string
  department: string
  documentType?: string
  filePath: string
  fileHash?: string
  wordCount?: number
  createdAt: string
}

export const useResearchStore = defineStore('research', {
  state: () => ({
    researchList: [] as ResearchItem[],
    loading: false,
    uploadProgress: false,
    errorMessage: null as string | null
  }),

  actions: {
    async fetchResearch(query = '', college = '') {
      this.loading = true
      this.errorMessage = null
      try {
        const res: any = await $fetch('/api/research', {
          params: { q: query.trim(), college }
        })
        this.researchList = res.data || []
        return this.researchList
      } catch (error: any) {
        this.errorMessage = error.statusMessage || 'Failed to load research items'
        this.researchList = []
        return []
      } finally {
        this.loading = false
      }
    },

    async uploadResearch(formData: FormData) {
      this.uploadProgress = true
      this.errorMessage = null
      try {
        const res: any = await $fetch('/api/research/upload', {
          method: 'POST',
          body: formData
        })
        // አዲሱን ጥናት ዝርዝር ውስጥ ከላይ ማከል
        if (res.data) {
          this.researchList.unshift(res.data)
        }
        return res
      } catch (error: any) {
        const msg = error.data?.statusMessage || error.statusMessage || error.message || 'Submission rejected'
        this.errorMessage = msg
        throw new Error(msg)
      } finally {
        this.uploadProgress = false
      }
    },

    // 🟢 አዲሱ የ Update Action (መረጃን ሳንሰርዝ በ ID አስተካክሎ ለማስቀመጥ)
    async updateResearch(id: number, payload: any) {
      this.uploadProgress = true
      this.errorMessage = null
      try {
        const res: any = await $fetch(`/api/research/${id}`, {
          method: 'PUT',
          body: payload
        })
        
        // በ list ውስጥ ያለውን ሬከርድ በአዲስ መረጃ መቀየር (ID ሳንቀይር)
        const index = this.researchList.findIndex(item => item.id === id)
        if (index !== -1 && res.data) {
          this.researchList[index] = res.data
        }
        return res
      } catch (error: any) {
        const msg = error.data?.statusMessage || error.statusMessage || error.message || 'Update failed'
        this.errorMessage = msg
        throw new Error(msg)
      } finally {
        this.uploadProgress = false
      }
    },

    // 🔴 Delete Action (ጥናትን ከዳታቤዝ እና ከስቶር መሰረዝ)
    async deleteResearch(id: number) {
      this.loading = true
      this.errorMessage = null
      try {
        const res: any = await $fetch(`/api/research/${id}`, {
          method: 'DELETE'
        })
        this.researchList = this.researchList.filter(item => item.id !== id)
        return res
      } catch (error: any) {
        const msg = error.data?.statusMessage || error.statusMessage || error.message || 'Delete failed'
        this.errorMessage = msg
        throw new Error(msg)
      } finally {
        this.loading = false
      }
    }
  }
})