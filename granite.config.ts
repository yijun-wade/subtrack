import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'subtrack',
  brand: {
    displayName: '숨만쉬어도', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: 'https://raw.githubusercontent.com/yijun-wade/subtrack/main/public/icon.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
