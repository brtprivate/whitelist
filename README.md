# 🚀 Web3 Whitelist Application

A modern, mobile-friendly Web3 whitelist application built with Next.js, supporting multiple currencies including USDT and E-Pound tokens.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)

## ✨ Features

- 🎯 **Simple 4-Step Process**: Connect wallet → Select currency → Join whitelist → Approve tokens
- 📱 **Mobile-First Design**: Fully responsive and optimized for all screen sizes
- 💰 **Multi-Currency Support**: USDT and E-Pound token integration
- 🔗 **Web3 Integration**: Built with Wagmi and RainbowKit
- ⚡ **Fast & Lightweight**: Optimized bundle size and performance
- 🎨 **Clean UI**: Modern design without gradients, focused on simplicity
- 🔐 **Secure**: Smart contract interactions with proper error handling

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Wagmi + RainbowKit + Viem
- **Blockchain**: Binance Smart Chain (BSC)
- **Deployment**: Netlify-ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/whitelist-app.git
   cd whitelist-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Add your environment variables:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
   ```

4. **Update contract addresses**

   Edit `src/lib/contracts.ts` and replace the placeholder E-Pound contract address:
   ```typescript
   export const EPOUND_CONTRACT_ADDRESS = 'your_epound_contract_address';
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Mobile Optimization

This application is built with a mobile-first approach:

- **Responsive Design**: Optimized for screens from 320px to desktop
- **Touch-Friendly**: Properly sized buttons and interactive elements
- **Compact UI**: Smaller components and spacing on mobile devices
- **Smart Content**: Essential information prioritized on small screens

## 🔧 Configuration

### Supported Currencies

Currently supports:
- **USDT**: Tether USD on BSC
- **E-Pound**: Electronic Pound token (configurable)

To add more currencies, update the `SUPPORTED_CURRENCIES` object in `src/lib/contracts.ts`.

### Smart Contracts

- **Whitelist Contract**: `0xe2ba9bcac21eb68f86938d166802283ac57c7530`
- **USDT Contract**: `0x55d398326f99059ff775485246999027b3197955`
- **E-Pound Contract**: Configurable (replace placeholder address)

## 🚀 Deployment

### Netlify Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Add environment variables in Netlify dashboard

3. **Environment Variables**
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
   ```

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── providers.tsx   # Web3 providers
├── components/         # React components
│   ├── SimpleSteps.tsx # Main whitelist flow
│   ├── CurrencySelector.tsx # Currency selection
│   └── ...
├── lib/               # Utilities and configurations
│   └── contracts.ts   # Smart contract configs
└── hooks/             # Custom React hooks
    └── useContract.ts # Contract interaction hook
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
