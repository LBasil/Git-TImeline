# Dans frontend/src/App.vue (on fera plus propre après)
<script setup>
import { onMounted } from "vue"

onMounted(async () => {
  const res = await fetch("http://localhost:3000/api/test")
  const data = await res.json()
  console.log(data)
})
</script>

<template>
  <h1>Git Timeline</h1>
</template>
