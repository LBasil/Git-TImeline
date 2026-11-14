<script setup>
import { ref, computed, onMounted } from "vue"

const API = import.meta.env.VITE_API_URL || "http://localhost:3000"
const PAGE_SIZE = 20

const branches = ref([])
const branch = ref("")
const commits = ref([])
const hasMore = ref(false)
const loading = ref(false)
const error = ref("")
const search = ref("")

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return commits.value
  return commits.value.filter(
    (c) => c.message.toLowerCase().includes(q) || c.author.toLowerCase().includes(q)
  )
})

const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" })
function relative(ts) {
  const diff = (ts - Date.now()) / 1000
  const units = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]]
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit)
  }
  return "à l'instant"
}

async function getJson(path) {
  const res = await fetch(API + path)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `Erreur ${res.status}`)
  return body
}

async function load(reset) {
  loading.value = true
  error.value = ""
  try {
    const skip = reset ? 0 : commits.value.length
    const data = await getJson(
      `/api/commits?ref=${encodeURIComponent(branch.value)}&limit=${PAGE_SIZE}&skip=${skip}`
    )
    commits.value = reset ? data.commits : commits.value.concat(data.commits)
    hasMore.value = data.hasMore
  } catch (e) {
    error.value = e.message === "Failed to fetch" ? "API injoignable. Le backend est-il lancé ?" : e.message
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const data = await getJson("/api/branches")
    branches.value = data.branches
    branch.value = data.current || data.branches[0]
    await load(true)
  } catch (e) {
    error.value = e.message === "Failed to fetch" ? "API injoignable. Le backend est-il lancé ?" : e.message
  }
})
</script>

<template>
  <main class="page">
    <h1>Git Timeline</h1>

    <div class="toolbar">
      <label>
        Branche
        <select v-model="branch" :disabled="!branches.length" @change="load(true)">
          <option v-for="b in branches" :key="b" :value="b">{{ b }}</option>
        </select>
      </label>
      <input v-model="search" type="search" placeholder="Filtrer les commits chargés" aria-label="Filtrer les commits" />
    </div>

    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <ol class="timeline">
      <li v-for="c in filtered" :key="c.oid">
        <code class="oid" :title="c.oid">{{ c.shortOid }}</code>
        <span class="message">{{ c.message }}</span>
        <span class="meta">{{ c.author }} · {{ relative(c.date) }}</span>
      </li>
    </ol>

    <p v-if="!loading && !error && !filtered.length" class="empty">Aucun commit à afficher.</p>

    <button v-if="hasMore" :disabled="loading" @click="load(false)">
      {{ loading ? "Chargement..." : "Charger plus" }}
    </button>
  </main>
</template>

<style scoped>
.page { max-width: 760px; margin: 0 auto; padding: 24px 16px; text-align: left; }
.toolbar { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; }
.toolbar input { flex: 1; min-width: 200px; padding: 6px 8px; }
.timeline { list-style: none; padding: 0; margin: 0 0 16px; border-left: 2px solid #8884; }
.timeline li { display: grid; grid-template-columns: auto 1fr; gap: 2px 12px; padding: 8px 0 8px 14px; }
.oid { grid-row: span 2; align-self: center; opacity: 0.7; }
.meta { font-size: 0.85em; opacity: 0.7; }
.error { color: #c0392b; }
.empty { opacity: 0.7; }
</style>
