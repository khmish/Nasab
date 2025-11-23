# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nasab is a family tree manager application built with React + TypeScript. It provides both a web interface and backend API for managing genealogical data, featuring AI-powered family member generation and interactive tree visualization using D3.js.

### Key Features
- Interactive family tree visualization with D3.js
- AI-powered family member generation using Google Gemini API
- Bilingual support (English/Arabic) with RTL support
- Backend API integration with optimistic updates
- MCP (Model Context Protocol) integration for enhanced AI capabilities
- Location-based family member mapping

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
# Edit .env with your actual API keys and configuration
```

Required environment variables:
- `GEMINI_API_KEY`: Your Google Gemini API key for AI generation
- Database configuration (optional, for MCP MySQL server)

## Project Structure

### Core Application Files

- **App.tsx**: Main application component with routing and layout
- **types.ts**: TypeScript interfaces for Person, FamilyData, and other core types
- **constants.ts**: Mock data, translations, and application constants
- **contexts/**: React Context providers for state management
- **components/**: React components for UI elements
- **services/**: API service layer and external integrations

### Key Directories

- `/components`:
  - `D3Tree.tsx`: Interactive tree visualization component using D3.js
  - `PersonModal.tsx`: Modal for adding/editing family members
  - `AIGenerator.tsx`: AI-powered family member generation interface

- `/contexts`:
  - `FamilyContext.tsx`: State management for family data and CRUD operations
  - `LanguageContext.tsx`: Language switching and translation management

- `/services`:
  - `api.ts`: Backend API client with optimistic updates
  - `geminiService.ts`: Google Gemini AI integration

## Architecture

### State Management
- Uses React Context API for global state
- `FamilyContext` manages family data with optimistic updates
- Handles relationship management automatically when adding/updating people
- Falls back to mock data when backend is unavailable

### API Integration
- Backend API expected at `http://localhost:8000/api` (configurable via REACT_APP_API_URL)
- Implements optimistic updates for responsive UI
- Gracefully falls back to client-side state when backend is unavailable
- RESTful API design: `/families/:id`, `/people`, `/people/:id`

### Data Model
- **Person**: Core entity with relationships (parentIds, childrenIds, partnerIds)
- **FamilyData**: Container for people and family metadata
- Supports complex family structures including multiple partners and generations

### D3 Tree Visualization
- Hierarchical tree layout with spouse connections
- RTL support for Arabic language
- Zoom and pan functionality
- Interactive node clicking for editing and adding relatives

### AI Integration
- Google Gemini API for generating family members from natural language descriptions
- AI service processes family structure descriptions and creates Person objects
- Handles relationship parsing from natural language

### Internationalization
- Bilingual support (English/Arabic)
- RTL layout support for Arabic
- Dynamic language switching without page reload
- Gender-aware translations

## MCP Integration

This project includes Model Context Protocol (MCP) servers for enhanced capabilities:

- **Memory Server**: Stores family tree data and genealogical information
- **Sequential Thinking Server**: Enhanced reasoning for complex family relationships
- **MySQL Server**: Persistent database storage (optional)

Run `./setup-mcp.sh` to configure MCP servers automatically.

## Development Notes

### Relationship Management
When adding or editing people, the context automatically maintains bidirectional relationships:
- Adding a child automatically updates the parent's childrenIds
- Partner relationships are maintained bidirectionally
- The system prevents duplicate relationship entries

### AI Generation
- Uses Google Gemini API to parse natural language family descriptions
- Extracts relationships, personal details, and family structure
- Automatically generates appropriate Person objects with relationships

### Responsive Design
- Mobile-first approach with collapsible sidebar
- D3 tree adapts to container size and supports touch interactions
- RTL-aware layout for Arabic language support

### Testing Backend Integration
The app will work with mock data when the backend is unavailable. To test full functionality:
1. Start the backend API server
2. Ensure the API is accessible at the configured URL
3. The app will automatically use the API instead of mock data

## Common Development Patterns

### Adding New Person Fields
1. Update `Person` interface in `types.ts`
2. Add form fields in `PersonModal.tsx`
3. Update translations in `constants.ts`
4. Handle any new API field mapping if needed

### Adding New API Endpoints
1. Update the API client in `services/api.ts`
2. Add corresponding methods to the context if needed
3. Handle any new error states or loading conditions

### Styling Guidelines
- Uses Tailwind CSS classes with custom design tokens
- Consistent spacing with `p-4`, `m-4` patterns
- Brand colors use `brand-600`, `brand-50` naming convention
- Responsive design with `md:`, `lg:` prefixes