Phát triển ứng dụng di động đa nền tảng (1) - Nguyễn Thị Châu Thi - 22IT274
# Weather PWA

A modern Progressive Web App for weather forecasting with offline capabilities.

## Description

This is a responsive weather application built as a Progressive Web App (PWA) using Next.js 14, TypeScript, and Tailwind CSS. The app provides real-time weather data, location-based forecasts, and works offline with cached data.

## Features

- Real-time weather data and 24-hour forecasts
- GPS location detection and city search
- Offline functionality with Service Worker caching
- Installable as a PWA on mobile and desktop
- Responsive design with modern UI components
- Error handling with fallback to demo data

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env.local` file with your OpenWeatherMap API key:
   ```
   NEXT_PUBLIC_WEATHER_API_KEY=your_api_key_here
   ```
4. Run development server: `npm run dev`

## Deployment

Built for deployment on Vercel with support for other Next.js hosting platforms.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
