# Travel Booking Platform

A modern, production-ready Next.js 14 TypeScript project with a comprehensive design system for a travel booking platform.

## 🚀 Features

- **Next.js 14** with App Router and TypeScript
- **Comprehensive Design System** with CSS custom properties
- **Modern UI Components** (buttons, cards, inputs)
- **Responsive Design** with mobile-first approach
- **Animation Utilities** with smooth transitions
- **Production-Ready** TypeScript interfaces
- **Form Handling** with react-hook-form and zod validation
- **Icon System** with Lucide React
- **Motion Effects** with Framer Motion

## 📦 Dependencies

- **Next.js 15.5.3** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **react-hook-form 7.62.0** - Form state management
- **zod 4.1.8** - Schema validation
- **lucide-react 0.544.0** - Icon library
- **framer-motion 12.23.12** - Animation library
- **clsx 2.1.1** - Conditional class names

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Design system CSS
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
├── context/               # React context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and types
│   ├── types.ts          # TypeScript interfaces
│   └── utils.ts          # Utility functions
└── styles/               # Additional stylesheets
```

## 🎨 Design System

### Color Palette

- **Primary Colors**: Blue palette (50-950)
- **Gray Scale**: Neutral grays (50-950)
- **Success Colors**: Green palette for positive states
- **Warning Colors**: Yellow/Orange palette for warnings
- **Error Colors**: Red palette for errors

### Typography

- **Font Family**: Inter (Google Fonts)
- **Font Sizes**: 12px to 72px scale
- **Font Weights**: 300 to 900
- **Line Heights**: Tight to loose options

### Spacing Scale

Based on 4px units:
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-6`: 24px
- `--space-8`: 32px
- And more...

### Component Classes

#### Buttons
```css
.btn                    /* Base button styles */
.btn-primary           /* Primary blue button */
.btn-secondary         /* Secondary white button */
.btn-success           /* Success green button */
.btn-warning           /* Warning yellow button */
.btn-error             /* Error red button */
.btn-sm                /* Small size */
.btn-lg                /* Large size */
.btn-xl                /* Extra large size */
```

#### Cards
```css
.card                  /* Base card styles */
.card-header           /* Card header section */
.card-body             /* Card content section */
.card-footer           /* Card footer section */
.card-elevated         /* Elevated shadow */
.card-flat             /* Flat design */
```

#### Inputs
```css
.input                 /* Base input styles */
.input-error           /* Error state */
.input-success         /* Success state */
.input-sm              /* Small size */
.input-lg              /* Large size */
```

### Animation Utilities

```css
.animate-fade-in       /* Fade in animation */
.animate-slide-up      /* Slide up animation */
.animate-slide-down    /* Slide down animation */
.animate-scale-in      /* Scale in animation */
.animate-bounce        /* Bounce animation */
```

## 🔧 TypeScript Interfaces

### User Management
- `UserRole` - User roles (SUPER_ADMIN, ADMIN, TOUR_OPERATOR, TRAVEL_AGENT)
- `User` - Complete user interface
- `UserProfile` - User profile information
- `Address` - Address structure

### Tour Operations
- `TourOperator` - Tour operator company details
- `CompanyDetails` - Business information
- `CommissionRates` - Commission structure
- `License` & `Certification` - Legal documents

### Package Management
- `Package` - Travel package interface
- `PackageType` - Package categories
- `PackagePricing` - Pricing structure
- `ItineraryDay` - Daily itinerary
- `Activity` - Activity details
- `Accommodation` - Hotel/resort info
- `Transportation` - Travel arrangements

### Booking System
- `Booking` - Booking interface
- `Traveler` - Traveler information
- `BookingPricing` - Booking costs
- `Review` - Customer reviews

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd travel-booking-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
```bash
npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📱 Responsive Design

The design system includes responsive utilities for all breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 768px
- **Desktop**: 768px - 1024px
- **Large Desktop**: 1024px - 1280px
- **Extra Large**: 1280px+

## 🎯 Usage Examples

### Using the Design System

```tsx
import { cn } from '@/lib/utils';

// Button with multiple classes
<button className={cn('btn', 'btn-primary', 'btn-lg')}>
  Book Now
</button>

// Card with conditional styling
<div className={cn('card', 'card-elevated', isActive && 'shadow-lg')}>
  <div className="card-header">
    <h3 className="text-xl font-semibold">Package Title</h3>
  </div>
  <div className="card-body">
    <p className="text-gray-600">Package description...</p>
  </div>
</div>

// Input with error state
<input 
  className={cn('input', hasError && 'input-error')}
  placeholder="Enter your email"
/>
```

### Using TypeScript Interfaces

```tsx
import { User, Package, Booking } from '@/lib/types';

const user: User = {
  id: '1',
  email: 'user@example.com',
  name: 'John Doe',
  role: UserRole.TRAVEL_AGENT,
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890'
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true
};
```

## 🌙 Dark Mode Support

The design system includes dark mode support through CSS custom properties:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-gray-50: #030712;
    --color-gray-100: #111827;
    /* ... more dark mode variables */
  }
}
```

## 🎨 Customization

### Adding New Colors

Add new color variables to `globals.css`:

```css
:root {
  --color-brand-50: #f0f9ff;
  --color-brand-500: #0ea5e9;
  --color-brand-900: #0c4a6e;
}
```

### Creating New Components

1. Define CSS classes in `globals.css`
2. Add TypeScript interfaces in `lib/types.ts`
3. Create React components in `components/`

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions and support, please open an issue in the repository.