<template>
  <div id="wrapper" class="fade-in">
    <!-- <Intro /> -->
    <HeaderBar id="main-content" />
    <router-view />
    <FooterBar />
    <button
      v-show = "showScrollToTop"
      class = "fixed bottom-[2.2rem] right-[2.2rem] bg-[#48e5c2] text-white border-none rounded-full w-[2.2rem] h-[2.2rem] cursor-pointer z-[1000] opacity-85 transition-all duration-300 text-[1.2rem] shadow-[0_4px_8px_rgba(0,0,0,0.1)] hover:opacity-100 hover:bg-[#69aee7]"
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
