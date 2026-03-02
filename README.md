# Mechanic Shop

A mobile application for managing auto repair shop operations built with React Native and Expo.

## Features

- **Customer Management** - Add, edit, and track customer information
- **Vehicle Tracking** - Manage vehicle records with search by vehicle number
- **Service Orders** - Create and track repair orders through their lifecycle (pending, in progress, completed)
- **Appointments** - Schedule and manage customer appointments
- **Payments** - Track payments for service orders
- **Photo Documentation** - Capture photos of vehicles and repairs using the device camera
- **Expense Tracking** - Record and monitor shop expenses
- **Analytics** - View business metrics and reports
- **PDF Invoices** - Generate and share invoices

## Tech Stack

- **Framework**: React Native with Expo SDK 55
- **Language**: TypeScript
- **Backend**: Supabase
- **State Management**: React Query (TanStack Query)
- **UI Components**: React Native Paper
- **Navigation**: Expo Router
- **Architecture**: Clean Architecture with MVVM pattern

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mechanic-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:

   Create a `.env` file in the root directory:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Running the App

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## Project Structure

```
src/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   └── (main)/            # Main app screens
├── core/                   # Core utilities and config
│   ├── config/            # Environment configuration
│   ├── constants/         # App constants
│   ├── errors/            # Error handling
│   └── utils/             # Utility functions
├── data/                   # Data layer
│   ├── datasources/       # Remote data sources
│   ├── models/            # Data mappers
│   └── repositories/      # Repository implementations
├── domain/                 # Domain layer
│   ├── entities/          # Business entities
│   └── repositories/      # Repository interfaces
├── presentation/           # Presentation layer
│   ├── components/        # Reusable UI components
│   └── viewmodels/        # Custom hooks (ViewModels)
├── services/              # App services
│   ├── camera/            # Camera service
│   └── pdf/               # PDF generation
└── theme/                 # Styling and theming
```

## License

Private
