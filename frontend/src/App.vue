<template>
  <!-- 🚪 루트 컴포넌트: 전체 애플리케이션의 라우팅 컨테이너 (Root router container) -->
  <router-view />
</template>

<script setup>
/**
 * @description App.vue는 이제 라우터의 진입점 역할만 수행합니다. (App.vue now acts only as the router entry point)
 */
</script>

<style>
/* 🖌️ 전역 테마 및 공통 스타일 (Global adjustments) */
body {
  margin: 0;
  padding: 0;
  background: #050A15;
}

/* 🌙 다크모드 기본 배경색 (Dark mode background) */
.body--dark {
  background: #050A15;
}

/* ☀️ 라이트모드 기본 배경색 (Light mode background) */
.body--light {
  background: #f1f5f9;
}
</style>
