/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 라이트 테마 배경색
        bg: {
          100: '#F8F9FA', // 연한 회색 배경
          200: '#FFFFFF', // 흰색
          300: '#F1F3F5', // 카드 배경
        },
        // 텍스트 색상
        text: {
          100: '#212529', // 진한 회색 (메인 텍스트)
          200: '#495057', // 회색 (부제목)
          300: '#868E96', // 연한 회색 (보조 텍스트)
        },
        // 액센트 색상
        accent: {
          main: '#8B5CF6', // 보라
          secondary: '#3B82F6', // 파랑
          tertiary: '#10B981', // 녹색
        },
        // 보더 색상
        border: '#DEE2E6',
      },
    },
  },
  plugins: [],
}
