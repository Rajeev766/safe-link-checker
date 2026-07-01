---
layout: page
---
<script setup>
import { ref } from 'vue'
import { verifyLink } from 'safe-link-checker'

const url = ref('')
const result = ref(null)
const loading = ref(false)
const error = ref(null)

const check = async () => {
  if (!url.value) return
  loading.value = true
  error.value = null
  try {
    result.value = await verifyLink(url.value)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

# Interactive Playground

Test the heuristic engine directly in your browser.

<div class="playground-container">
  <input v-model="url" type="url" placeholder="https://example.com" @keyup.enter="check" />
  <button @click="check" :disabled="loading">{{ loading ? 'Checking...' : 'Verify Link' }}</button>

  <div v-if="error" class="error">{{ error }}</div>

  <div v-if="result" class="result" :class="{ safe: result.safe, danger: !result.safe }">
    <h2>Score: {{ result.trustScore }}/100</h2>
    <p><strong>Decision:</strong> {{ result.decision }}</p>
    <p><strong>Summary:</strong> {{ result.summary }}</p>
    <details>
      <summary>View Evidence</summary>
      <pre>{{ JSON.stringify(result.evidence, null, 2) }}</pre>
    </details>
  </div>
</div>

<style>
.playground-container { margin-top: 2rem; padding: 2rem; background: var(--vp-c-bg-soft); border-radius: 8px; }
input { width: 100%; padding: 0.75rem; border: 1px solid var(--vp-c-divider); border-radius: 4px; margin-bottom: 1rem; background: var(--vp-c-bg); color: var(--vp-c-text-1); }
button { background: var(--vp-c-brand); color: white; padding: 0.75rem 1.5rem; border-radius: 4px; font-weight: bold; cursor: pointer; }
button:disabled { opacity: 0.5; }
.result { margin-top: 2rem; padding: 1.5rem; border-radius: 8px; }
.safe { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); }
.danger { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }
.error { color: red; margin-top: 1rem; }
</style>
