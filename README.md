# Superdocs (Warp Suite)

Superdocs is an AI-native workspace with integrated **Docs**, **Sheets**, **Slides**, and **Warp AI** file chat.

## Features

- Unified workspace with library + tabbed editing across document types
- Rich text docs editor (TipTap-based)
- Spreadsheet editor with grid data persistence
- Slides editor with:
  - Multi-slide deck editing
  - Templates (Title Deck, Pitch, Agenda)
  - Text, shape, and image elements
  - Drag-and-drop positioning
  - Element property controls (typography, color, dimensions, coordinates)
  - Slide duplication, deletion, and reordering
- Cross-file AI context support with Warp Assistant and Warp chat

## Tech

- Next.js App Router (Next 16)
- React 19
- TypeScript
- Tailwind CSS
- Clerk (authentication)

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Clerk setup

This project uses Clerk with App Router + Proxy.

1. Create a Clerk app in the Clerk dashboard.
2. Add your Clerk environment variables in `.env.local`.
3. Start the app and open the top nav.
4. Click **Sign up** and create your first test user.

After sign-up succeeds and your profile icon appears in nav, congratulations — Clerk is wired correctly.

### Implemented Clerk requirements

- `clerkMiddleware()` configured in `src/proxy.ts`
- `<ClerkProvider>` inside `<body>` in `src/app/layout.tsx`
- App Router structure (`src/app/...`)
- Auth UI uses:
  - `<Show when="signed-out">` + `<SignInButton>` + `<SignUpButton>`
  - `<Show when="signed-in">` + `<UserButton>`
- `auth()` from `@clerk/nextjs/server` used with `async/await` in root layout

## Next Clerk steps

- Organizations: https://clerk.com/docs/guides/organizations/overview
- Components: https://clerk.com/docs/reference/components/overview
- Dashboard: https://dashboard.clerk.com/

## Scripts

- `npm run dev` - local development
- `npm run lint` - lint checks
- `npm run build` - production build
