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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and commit: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data API
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Lucide](https://lucide.dev/) for icons
- [Vercel](https://vercel.com/) for hosting platform

## 📞 Support

If you have any questions or issues:
- Create an [Issue](https://github.com/chouthi/MyWeatherPWA/issues)
- Contact: [your-email@example.com](mailto:your-email@example.com)

---

**Made with ❤️ by [chouthi](https://github.com/chouthi)**

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
