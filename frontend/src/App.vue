<script setup>
import { ref, onMounted } from "vue"

const commits = ref([])

onMounted(async () => {
  const res = await fetch("http://localhost:3000/api/commits")
  commits.value = await res.json()
})
</script>

<template>
  <h1>Git Timeline</h1>
  <ul>
    <li v-for="c in commits" :key="c.oid">
      <b>{{ c.author }}</b> - {{ c.message }}  
      <i>({{ new Date(c.date).toLocaleString() }})</i>
    </li>
  </ul>
</template>
