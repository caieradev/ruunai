# RuunAI App

A modern, dark-themed running training app with an intelligent onboarding flow.

## Overview

This is the main RuunAI application (MVP UI), featuring:
- Multi-step onboarding quiz with branching logic
- Dark, minimalist, athletic design matching the landing page
- Fully responsive and mobile-first
- TypeScript + Next.js 14+ with App Router
- Tailwind CSS for styling
- LocalStorage persistence for onboarding progress

## Tech Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Fonts**: Inter (sans) and Space Grotesk (display)

## Design System

The app uses the same design system as the landing page:
- **Background**: #0a0a0a (dark-bg)
- **Surface**: #151515 (dark-surface)
- **Accent**: #00e5a0 (teal green) and #00b8d4 (cyan)
- **Text**: White primary, gray secondary/muted
- **Fonts**: Inter for body, Space Grotesk for headings

## Project Structure

```
ruunai-app/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Home page (onboarding entry)
│   ├── globals.css         # Global styles with Tailwind v4
│   ├── login/
│   │   └── page.tsx        # Login page (placeholder)
│   └── app/
│       └── page.tsx        # Dashboard page (placeholder)
├── components/
│   ├── Header.tsx          # Header with logo and login link
│   ├── Logo.tsx            # RuunAI logo component
│   ├── ui/
│   │   ├── Button.tsx      # Button component
│   │   ├── Input.tsx       # Input component
│   │   ├── Card.tsx        # Card component
│   │   ├── RadioGroup.tsx  # Radio group for single selection
│   │   ├── Checkbox.tsx    # Checkbox component
│   │   └── ProgressBar.tsx # Progress indicator
│   └── onboarding/
│       ├── OnboardingFlow.tsx  # Main onboarding container
│       └── steps/
│           ├── GoalStep.tsx
│           ├── EventDetailsStep.tsx
│           ├── ExperienceStep.tsx
│           ├── BeginnerComfortStep.tsx
│           ├── AdvancedFitnessStep.tsx
│           ├── WeeklyVolumeStep.tsx
│           ├── DaysPerWeekStep.tsx
│           ├── PreferredDaysStep.tsx
│           ├── LongestRunStep.tsx
│           ├── InjuriesStep.tsx
│           ├── EquipmentStep.tsx
│           ├── PlanPreferencesStep.tsx
│           └── ReviewStep.tsx
├── lib/
│   ├── utils.ts            # Utility functions (cn)
│   └── onboarding/
│       ├── types.ts        # TypeScript types
│       ├── steps.ts        # Step configuration and branching logic
│       └── context.tsx     # React Context for state management
└── public/
    └── images/             # SVG assets from landing page
```

## Features

### Onboarding Flow

The onboarding collects essential information through a smart, branching quiz:

1. **Goal** (branching)
   - 5K, 10K, Half Marathon, Marathon, or General Fitness
   - If General Fitness: skip event details

2. **Event Details** (conditional)
   - Event date and target time (optional)

3. **Experience Level**
   - Beginner, Intermediate, or Advanced
   - Branching based on selection

4. **Beginner Comfort** (conditional for beginners)
   - Can you run 20 minutes continuously?

5. **Advanced Fitness** (conditional for advanced)
   - Recent 5K/10K times, easy pace

6. **Weekly Volume**
   - Current weekly running distance

7. **Days Per Week**
   - Training days availability (2-7 days)

8. **Preferred Days**
   - Optional: Select specific weekdays

9. **Longest Run**
   - Distance of longest recent run

10. **Injuries/Limitations**
    - None, Knee, Shin, Foot, Other (with details)

11. **Equipment**
    - Optional: Treadmill, Track, Gym, Hills

12. **Plan Preferences**
    - Style: Time-based vs Distance-based
    - Flexibility: Structured vs Flexible
    - Intensity: Low, Medium, High

13. **Review**
    - Summary of all answers

### Branching Logic

The flow dynamically adjusts based on user answers:
- Progress bar updates to show correct total steps
- Conditional steps appear/disappear based on previous answers
- Back button maintains context through conditional branches

### State Management

- React Context for global state
- LocalStorage persistence (survives page refresh)
- Typed with TypeScript for safety
- Reset functionality to clear and restart

### Pages

- **/** - Onboarding flow
- **/login** - Login page (placeholder, logs to console)
- **/app** - Dashboard (placeholder with reset button)

### UX Features

- Progress indicator showing step X of Y
- Validation: Next button disabled until required fields complete
- Back button on all steps except first
- Smooth scrolling on step transitions
- "Already have an account? Log in" link in header
- Success state: console.log of complete profile + redirect to /app
- Keyboard navigation and focus states
- Accessible contrast and ARIA labels

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Output

On onboarding completion:
1. User data is logged to console as JSON
2. Data is saved to localStorage
3. User is redirected to /app dashboard

Example console output:
```json
{
  "goal": "HALF_MARATHON",
  "eventDate": "2024-06-15",
  "targetTime": "1:45:00",
  "experienceLevel": "INTERMEDIATE",
  "weeklyVolume": "15_30",
  "daysPerWeek": 4,
  "preferredDays": ["Monday", "Wednesday", "Friday", "Sunday"],
  "longestRecentRun": 15,
  "injuryType": "NONE",
  "equipment": ["track", "gym"],
  "planStyle": "DISTANCE_BASED",
  "planFlexibility": "STRUCTURED",
  "intensityTolerance": "MEDIUM"
}
```

## Next Steps (Not Implemented)

- Supabase authentication
- Backend integration for plan generation
- AI training plan generation
- Strava/Garmin integration
- Payment/subscription system
- Plan export (PDF, Calendar)

## Notes

- No backend yet - everything is client-side
- Login is a placeholder (just console.logs credentials)
- Dashboard is a placeholder with mock data
- Plan generation is not implemented (just shows the collected data)
