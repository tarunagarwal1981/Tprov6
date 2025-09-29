# Itinerary Creation Implementation Plan

## Overview

This document outlines the implementation plan for the enhanced itinerary creation flow for travel agents, focusing on simplicity and effectiveness.

## Current System Analysis

### ✅ Existing Infrastructure
- Basic itinerary creation system exists
- Package search and filtering capabilities
- Lead management system with customer data
- Database schema supports itineraries, days, and activities
- Agent service with itinerary creation methods

### ❌ Current Gaps
- No two-panel package selection interface
- No cart-like package selection experience
- No day-by-day planning interface
- No auto-distribution of multi-day packages
- No drag-and-drop functionality
- No budget validation and warnings
- No package recommendations based on lead preferences

## Recommended Itinerary Creation Flow

### **Step 1: Entry Point - From Lead**
When agent clicks "Create Itinerary" from a lead (e.g., "5 night package for Bali"):
- Lead data auto-populates: destination, duration, customer name, budget, preferences
- System immediately queries relevant packages for that destination

### **Step 2: Package Discovery & Selection**
Agent sees a **two-panel interface**:

**Left Panel - Available Packages** (searchable/filterable):
- Shows all Bali packages from tour operators
- Key info visible: package name, price, duration, operator, rating
- Filters: package type (hotel, activities, full tour, transport), price range, duration
- Search bar for quick finding
- Each package has "Add to Itinerary" button

**Right Panel - Building Itinerary**:
- Shows selected packages
- Running total cost
- Package count
- Remove option for each selected package

### **Step 3: Itinerary Assembly**
After selecting packages, agent proceeds to **Day-by-Day Planning**:

```
Day 1 | Date: June 15, 2025 | Location: Bali
├─ Available Packages (from selected):
│  ├─ Bali Airport Transfer - Add
│  ├─ Beach Resort Stay - Add  
│  └─ Water Sports Package - Add
└─ Added Activities: [List of added items for Day 1]

Day 2 | Date: June 16, 2025 | Location: Ubud
├─ Available Packages...
└─ Added Activities...
```

**Key features:**
- Auto-distribute multi-day packages across relevant days
- Drag-and-drop packages to specific days
- Add custom activities (manual entries) alongside packages
- View daily timeline/schedule
- Add notes per day

### **Step 4: Itinerary Details & Finalization**
Agent completes:
- Itinerary title (auto-generated but editable: "Sarah Johnson - Bali Adventure")
- Description/summary
- Start/end dates (from lead)
- Pricing breakdown:
  - Base cost (sum of packages)
  - Agent commission (calculated)
  - Final customer price

### **Step 5: Review & Save**
- Full itinerary preview
- Cost summary
- Package list
- Day-by-day breakdown
- Save as draft or finalize

## Database Schema Changes

### New Tables

```sql
-- Enhanced itinerary creation sessions
CREATE TABLE itinerary_creation_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PACKAGE_SELECTION' CHECK (status IN ('PACKAGE_SELECTION', 'DAY_PLANNING', 'DETAILS', 'REVIEW')),
  selected_packages JSONB DEFAULT '[]',
  day_assignments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Package recommendations based on lead preferences
CREATE TABLE package_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  recommendation_score DECIMAL(3,2) DEFAULT 0.0,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced itinerary activities with better day management
CREATE TABLE itinerary_day_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  itinerary_day_id UUID REFERENCES itinerary_days(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  activity_name TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('PACKAGE', 'CUSTOM', 'TRANSFER', 'MEAL', 'ACCOMMODATION')),
  time_slot TEXT NOT NULL,
  duration_hours DECIMAL(4,2) DEFAULT 1.0,
  cost DECIMAL(10,2) DEFAULT 0.00,
  location TEXT,
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Enhanced Existing Tables

```sql
-- Add fields to existing itineraries table
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS creation_session_id UUID REFERENCES itinerary_creation_sessions(id);
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS budget_warning BOOLEAN DEFAULT false;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS package_count INTEGER DEFAULT 0;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS estimated_duration_hours DECIMAL(6,2) DEFAULT 0.0;

-- Add fields to existing packages table for better filtering
ALTER TABLE packages ADD COLUMN IF NOT EXISTS recommended_for_trip_types TEXT[] DEFAULT '{}';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS average_booking_time INTEGER DEFAULT 0; -- in days
ALTER TABLE packages ADD COLUMN IF NOT EXISTS seasonal_availability JSONB DEFAULT '{}';
```

## Component Architecture

### New Components

```
src/components/itinerary/
├── creation/
│   ├── ItineraryCreationWizard.tsx          # Main wizard container
│   ├── PackageSelectionPanel.tsx            # Left panel - package discovery
│   ├── SelectedPackagesPanel.tsx            # Right panel - selected packages
│   ├── DayPlanningInterface.tsx             # Day-by-day planning
│   ├── ItineraryDetailsForm.tsx             # Final details and pricing
│   └── ItineraryReviewPanel.tsx             # Review and save
├── package/
│   ├── PackageDiscoveryCard.tsx             # Enhanced package cards
│   ├── PackageRecommendationEngine.tsx      # Smart recommendations
│   ├── PackageFilterPanel.tsx               # Advanced filtering
│   └── PackageSearchBar.tsx                 # Enhanced search
├── day/
│   ├── DayPlanningCard.tsx                  # Individual day planning
│   ├── ActivityTimeline.tsx                 # Timeline view
│   ├── DragDropActivityList.tsx             # Drag & drop activities
│   └── DaySummaryCard.tsx                   # Day overview
└── shared/
    ├── BudgetTracker.tsx                    # Budget monitoring
    ├── ProgressIndicator.tsx                # Wizard progress
    ├── CostCalculator.tsx                   # Real-time cost calculation
    └── ValidationPanel.tsx                  # Form validation
```

### Enhanced Existing Components

```
src/components/packages/
├── PackageCard.tsx                          # Add "Add to Itinerary" button
├── PackageGrid.tsx                          # Support selection mode
└── PackageFilters.tsx                       # Add itinerary-specific filters

src/app/agent/itineraries/
├── create/
│   └── page.tsx                             # Replace with new wizard
└── [id]/
    └── page.tsx                             # Enhanced itinerary view
```

### State Management

```typescript
// New context for itinerary creation
interface ItineraryCreationContext {
  // Session state
  sessionId: string;
  currentStep: 'PACKAGE_SELECTION' | 'DAY_PLANNING' | 'DETAILS' | 'REVIEW';
  
  // Lead data
  lead: Lead;
  
  // Package selection
  availablePackages: Package[];
  selectedPackages: SelectedPackage[];
  packageFilters: PackageFilters;
  
  // Day planning
  itineraryDays: ItineraryDay[];
  dayAssignments: DayAssignment[];
  
  // Budget tracking
  budget: {
    total: number;
    used: number;
    remaining: number;
    overBudget: boolean;
  };
  
  // Actions
  addPackage: (package: Package) => void;
  removePackage: (packageId: string) => void;
  assignPackageToDay: (packageId: string, dayId: string) => void;
  moveActivity: (activityId: string, fromDay: string, toDay: string) => void;
  updateBudget: () => void;
}
```

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema updates and migrations
- [ ] TypeScript interfaces and types
- [ ] Context setup for itinerary creation
- [ ] Service layer updates for package recommendations

### Phase 2: Core Components (Week 3-4)
- [ ] PackageSelectionPanel with search and filtering
- [ ] SelectedPackagesPanel with cart-like functionality
- [ ] PackageDiscoveryCard with "Add to Itinerary" button
- [ ] BudgetTracker for real-time budget monitoring

### Phase 3: Day Planning (Week 5-6)
- [ ] DayPlanningInterface for day-by-day planning
- [ ] DragDropActivityList for activity management
- [ ] ActivityTimeline for visual timeline
- [ ] DaySummaryCard for day overview

### Phase 4: Integration & Polish (Week 7-8)
- [ ] ItineraryCreationWizard to tie everything together
- [ ] Form validation and error handling
- [ ] Performance optimizations
- [ ] Testing and bug fixes

### Phase 5: Advanced Features (Week 9-10)
- [ ] Package recommendation engine
- [ ] Itinerary templates
- [ ] Multi-agent collaboration
- [ ] Analytics and insights

## Technical Considerations

### Performance
- Virtual scrolling for large package lists
- Lazy loading of package details
- Caching of package recommendations
- Debounced search and filtering

### User Experience
- Progressive disclosure of information
- Clear loading states
- Undo/redo functionality
- Auto-save drafts

### Mobile Responsiveness
- Responsive two-panel layout
- Touch-friendly drag-and-drop
- Mobile-optimized package cards
- Swipe gestures for navigation

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Focus management

## Success Metrics

- **Creation Time**: < 15 minutes for complete itinerary
- **Package Selection**: < 5 minutes to select relevant packages
- **Day Planning**: < 10 minutes for day-by-day arrangement
- **Budget Accuracy**: > 95% accuracy in cost calculations
- **User Satisfaction**: > 4.5/5 rating from agents

## Key Design Principles

**1. Progressive Disclosure**
Don't show everything at once. Start with package selection, then refine day-by-day.

**2. Smart Defaults**
- Pre-fill from lead data
- Auto-calculate prices
- Suggest package combinations

**3. Flexibility**
- Mix tour operator packages with custom entries
- Adjust timing and sequence
- Add personal notes

**4. Visual Clarity**
```
┌─────────────────────────────────────────────┐
│  Creating Itinerary for: Lead #1234         │
│  Customer: Sarah | Destination: Bali        │
│  Duration: 5 nights | Budget: $2000         │
└─────────────────────────────────────────────┘

┌──────────────────┐  ┌───────────────────────┐
│ Available        │  │ Selected Packages (3)  │
│ Packages (47)    │  │                        │
│                  │  │ ✓ Bali Resort Stay    │
│ 🔍 Search...     │  │   $450 x 5 nights     │
│                  │  │ ✓ Water Sports        │
│ 🏨 Hotel (12)    │  │   $150                │
│ 🎯 Activities(20)│  │ ✓ Cultural Tour       │
│ 🚗 Transport (8) │  │   $200                │
│ 🍽️ Food (7)      │  │                       │
│                  │  │ Total: $2,450         │
│ [Package Card]   │  │                       │
│ [Package Card]   │  │ [Next: Plan Days →]   │
│ [Package Card]   │  │                       │
└──────────────────┘  └───────────────────────┘
```

**5. Error Prevention**
- Warn if total exceeds customer budget
- Highlight missing essentials (hotel, transport)
- Validate date ranges

**6. Quick Actions**
- Duplicate similar itineraries
- Save as template for future
- Quick package recommendations based on lead preferences

## Workflow Summary

```
Lead (5 nights Bali) 
    → Click "Create Itinerary"
    → Browse/Search Bali packages
    → Select relevant packages (add to cart-like)
    → Arrange packages by day
    → Add details & pricing
    → Review & Save
    → [Later: Send to customer]
```

This flow is **intuitive** (similar to e-commerce), **efficient** (minimal clicks), and **flexible** (works for simple or complex itineraries).
