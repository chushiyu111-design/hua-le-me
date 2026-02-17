<template>
  <div id="hualeme-app">
    <Transition name="page" mode="out-in">
      <router-view />
    </Transition>
    <TabBar />
  </div>
</template>

<script setup>
import TabBar from '@/components/TabBar.vue'
</script>

<style scoped>
#hualeme-app {
  min-height: 100vh;
  position: relative;
  max-width: 430px;
  margin: 0 auto;
}
</style>
