# Library Management System - Frontend

This is the frontend application for the Library Management System, built with React, TypeScript, and Vite.

## Features

- **Authentication**: User registration and login with role-based access control
- **Book Management**: View, search, add, edit, and delete books (librarian access)
- **Checkouts**: Students can borrow and return books
- **User Management**: Librarians can manage user accounts
- **Responsive Design**: Built with modern UI components using shadcn/ui and TailwindCSS

## Roles & Permissions

- **Student**: Can browse books, view details, checkout and return books
- **Librarian**: Has full access to manage books, checkouts, and users

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend server running (see API configuration below)

### Installation

1. Clone the repository

   ```
   git clone <repository-url>
   cd focustest-library
   ```

2. Install dependencies

   ```
   npm install
   ```

   or

   ```
   yarn
   ```

3. Configure environment variables
   - Copy `.env.example` to `.env`
   ```
   cp .env.example .env
   ```
   - Update the API URL if needed (default: `http://localhost:3000/api/v1`)

### Development

Start the development server:

```
npm run dev
```

or

```
yarn dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```
npm run build
```

or

```
yarn build
```

### Preview Production Build

```
npm run preview
```

or

```
yarn preview
```

## Project Structure

```
frontend/
├─ src/
│  ├─ assets/       # Static assets
│  ├─ components/   # Reusable UI components
│  ├─ hooks/        # Custom React hooks
│  ├─ lib/          # Library configurations
│  ├─ pages/        # Application pages
│  ├─ services/     # API service functions
│  ├─ store/        # Redux store configuration
│  ├─ types/        # TypeScript type definitions
│  ├─ App.tsx       # Main application component
│  └─ main.tsx      # Application entry point
├─ .env.example     # Example environment variables
├─ index.html       # HTML entry point
├─ tailwind.config.js # Tailwind CSS configuration
└─ vite.config.ts   # Vite configuration
```

## Technologies Used

- **React 19**: Modern React with hooks
- **TypeScript**: Type safety and better developer experience
- **Vite**: Fast development environment and optimized builds
- **React Router**: Client-side routing
- **Redux Toolkit**: State management
- **React Query**: Data fetching and caching
- **shadcn/ui**: UI component library
- **TailwindCSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **Zod**: Schema validation
- **React Hook Form**: Form handling

## API Integration

The frontend communicates with a REST API. The base URL can be configured in the `.env` file:

```
VITE_API_URL=http://localhost:3000/api/v1
```

## Linting & Type Checking

The project uses ESLint with TypeScript integration for code quality:

```
npm run lint
```

or

```
yarn lint
```
