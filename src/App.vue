<template>
  <div id="wrapper" class="fade-in">
    <!-- <Intro /> -->
    <HeaderBar id="main-content" />
    <router-view />
    <FooterBar />
    <button
      v-show = "showScrollToTop"
      class = "scroll-to-top"
      @click = "scrollToTop"
      aria-label = "Back to top"
    >
      <i class="el-icon-top"></i>
      ↑
    </button>
  </div>
</template>

<script setup>
import HeaderBar from './components/HeaderBar.vue'
import FooterBar from './components/FooterBar.vue'
import Intro from './components/Intro.vue'
import UploadFile from './components/UploadFile.vue'

import { ref, onMounted, onUnmounted } from 'vue'

const showScrollToTop = ref(false);

function handleScroll() {
  showScrollToTop.value = window.scrollY > 100;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style>
.center-card {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 6px 40px rgba(0,0,0,0.12);
  padding: 2rem 2rem 0.5rem 2rem;
  margin-top: 3rem;
  margin-bottom: 3rem;
}

.scroll-to-top {
  position: fixed;
  bottom: 2.2rem;
  right: 2.2rem;
  background: #48e5c2;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 2.2rem;
  height: 2.2rem;
  cursor: pointer;
  z-index: 1000;
  opacity: 0.85;
  transition: opacity 0.3s background 0.3s;
  font-size: 1.2rem;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.scroll-to-top:hover {
  opacity: 1;
  background: #69aee7;
}


</style>