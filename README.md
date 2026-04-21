# SmarTrip - Tourism Intelligent Platform

![License](https://img.shields.io/badge/license-GPL%203.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![Vite](https://img.shields.io/badge/vite-4.4.5-646CFF.svg)

> A comprehensive React-based tourism platform with AI-powered travel planning, user dashboards, and business management tools.

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Development](#development)
- [Testing](#testing)
- [Security](#security)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Background

The Tourism Intelligent Platform is a modern web application designed to revolutionize how travelers plan, manage, and share their journeys. Built with React 18 and Vite, it combines AI-powered recommendations with comprehensive travel management tools, serving both individual travelers and tourism businesses.

### Key Features

- **AI Assistant Interface**: Intelligent travel recommendations and planning assistance
- **User Dashboard**: Personalized travel overview with statistics
- **Travel Planning UI**: Interactive trip planning with itinerary builder
- **Business Dashboard**: Management tools for tourism companies
- **Social Interaction**: Community features for travelers
- **Responsive Design**: Mobile-first approach with modern UI
- **Authentication**: Secure user authentication and authorization
- **State Management**: Context API for scalable state management

## Install

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/voyager-web-client.git
cd voyager-web-client
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=TourismAI Platform
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

## Usage

### Demo Account

For testing purposes, use these demo credentials:
- Email: `demo@tourismai.com`
- Password: `password`

### Main Features

#### AI Assistant
Access the AI assistant through the navigation menu to get personalized travel recommendations, planning assistance, and destination insights.

#### Travel Planning
Use the travel planning tools to:
- Search and filter destinations
- Create detailed trip itineraries
- Set budgets and preferences
- Get AI-powered recommendations

#### Business Dashboard
Business users can:
- View revenue analytics
- Manage bookings and services
- Track performance metrics
- Create promotions

## API

The application integrates with several API services:

### Authentication Service
```javascript
import { authService } from './services/authService'

// Login
await authService.login({ email, password })

// Register
await authService.register(userData)
```

### Travel Service
```javascript
import { travelService } from './services/travelService'

// Get trips
const trips = await travelService.getTrips()

// Create trip
const trip = await travelService.createTrip(tripData)
```

### AI Service
```javascript
import { aiService } from './services/aiService'

// Chat with AI
const response = await aiService.sendMessage(message)

// Get recommendations
const recommendations = await aiService.getRecommendations(preferences)
```

## Development

### Tech Stack

- **Frontend**: React 18, Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Styling**: CSS with CSS variables
- **State Management**: React Context API
- **Build Tool**: Vite

### Project Structure

```
src/
├── components/          # Reusable UI & architectural elements
│   ├── UI/              # Generic, reusable atom components
│   ├── Layout/          # Page wrappers and structural skeletons
│   ├── Header/          # Global navigation header
│   ├── Sidebar/         # Contextual navigation sidebar
│   └── Footer/          # Application footer
├── contexts/            # Global state management via React Context
│   ├── AuthContext.jsx  # User session & permissions
│   ├── ThemeContext.jsx # Dark/Light mode & styling state
│   └── TravelContext.jsx# Shared travel & itinerary data
├── hooks/               # Custom logic and side-effect abstractions
│   ├── useAuth.js       # Auth logic & state access
│   ├── useLocalStorage.js # Persistent browser storage management
│   ├── useDebounce.js   # Input performance optimization
│   └── useApi.js        # Standardized fetch/request handling
├── pages/               # Top-level view components (Routes)
│   ├── Home/            # Landing & Marketing
│   ├── Dashboard/       # Main user overview
│   ├── AIAssistant/     # AI-driven chat/help interface
│   ├── TravelPlanning/  # Core travel logic & tools
│   ├── Business/        # Management for business partners
│   ├── Auth/            # Login, Signup, & Recovery
│   ├── Profile/         # User settings & personalization
│   └── Social/          # Community & feed features
├── services/            # API & external communication layer
│   ├── api.js           # Axios/Fetch base configuration
│   ├── authService.js   # Auth-specific endpoints
│   ├── travelService.js # Travel data orchestration
│   ├── businessService.js # Business logic endpoints
│   └── aiService.js     # AI backend integration
├── App.jsx              # Main router & provider wrapper
├── main.jsx             # React DOM entry point
└── index.css            # Global typography & base styles
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Style

The project follows these conventions:
- Component-based architecture
- Custom hooks for logic reuse
- Context API for global state
- CSS variables for theming
- Mobile-first responsive design

## Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Test Structure

- Unit tests for components and hooks
- Integration tests for API services
- End-to-end tests for user workflows

## Security

### Authentication

- JWT-based authentication
- Protected routes with role-based access
- Secure token storage
- Automatic token refresh

### Data Protection

- Input validation and sanitization
- XSS prevention
- Environment variable protection
- Secure API communication

### Security Headers

The application implements security headers including:
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Content-Security-Policy

## Deployment

### Docker Deployment

Build and run with Docker:

```bash
# Build image
docker build -t tourism-platform .

# Run container
docker run -p 3000:3000 tourism-platform
```

### Production Build

```bash
# Build for production
npm run build

# Preview build
npm run preview
```

### Environment Configuration

Production environment variables:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_NAME=TourismAI Platform
NODE_ENV=production
```

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests if applicable**
5. **Ensure all tests pass**
   ```bash
   npm test
   ```
6. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
7. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

### Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming environment for all contributors.

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.

### License Summary

- **Commercial Use**: Yes
- **Modification**: Yes
- **Distribution**: Yes
- **Private Use**: Yes
- **Liability**: No
- **Warranty**: No

### Copyright

© 2024 Voyager Team. All rights reserved.