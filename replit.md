# Sistema de Gerenciamento de Indicadores de Inspeção

## Overview
This is a modern web application built for managing inspection indicators for the Civil Police of Bahia (ASTEC - CORREPOL). The system provides a comprehensive dashboard for tracking inspection data, monitoring deadlines, and generating compliance reports. It's built as a full-stack application using React on the frontend and Express.js on the backend, with a clean and professional interface designed specifically for police inspection management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application follows a modern full-stack architecture with clear separation between client and server components:

- **Frontend**: React 18 SPA with TypeScript
- **Backend**: Express.js REST API with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query for server state
- **Build Tool**: Vite for development and production builds

## Key Components

### Frontend Architecture
The client-side application is organized into several key areas:

1. **Authentication System**: Simple login page with credential validation against hardcoded admin credentials (username: astec.admin, password: Correpol@2025#BA)
2. **Dashboard Tabs**: Four main sections - General Dashboard, Gallery, Deadlines, and Normalization
3. **Component Library**: Built using shadcn/ui components for consistent UI/UX
4. **Data Visualization**: Charts using Recharts library for inspection analytics
5. **PDF Generation**: Built-in PDF report generation using jsPDF

### Backend Architecture
The server-side follows RESTful API principles:

1. **Express Router**: Centralized route management in `/server/routes.ts`
2. **Storage Layer**: Abstract storage interface with in-memory implementation
3. **CSV Processing**: PapaParse integration for importing inspection data
4. **Authentication**: Simple session-based auth with hardcoded credentials

### Database Schema
The application uses Drizzle ORM with PostgreSQL, defining two main tables:

1. **Users Table**: Basic user management with username/password
2. **Inspections Table**: Comprehensive inspection data including:
   - Basic info (number, unit, department, COORPIN)
   - Inspection details (date, inspector, non-compliance)
   - Deadlines and status tracking
   - Criticality levels

## Data Flow

1. **CSV Import**: System can load inspection data from CSV files on startup
2. **Authentication Flow**: Users authenticate via login form, credentials stored in localStorage
3. **Data Filtering**: Interactive filters on the frontend query the backend for filtered results
4. **Report Generation**: PDF reports generated client-side using inspection data
5. **Real-time Updates**: React Query manages data fetching and caching

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with modern hooks
- **Express.js**: Backend web framework
- **TypeScript**: Type safety across the stack
- **Vite**: Development server and build tool

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built React components
- **Radix UI**: Headless UI primitives
- **Lucide React**: Icon library

### Data Management
- **Drizzle ORM**: TypeScript-first PostgreSQL ORM
- **@neondatabase/serverless**: Postgres database driver
- **React Query**: Server state management
- **PapaParse**: CSV parsing library

### Visualization and Reports
- **Recharts**: Chart library for data visualization
- **jsPDF**: PDF generation library
- **date-fns**: Date manipulation utilities

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

1. **Development**: Uses Vite dev server with HMR and Express backend
2. **Production Build**: 
   - Frontend builds to `dist/public` directory
   - Backend bundles with esbuild for Node.js execution
3. **Environment Variables**: Requires `DATABASE_URL` for PostgreSQL connection
4. **Static Assets**: Served through Express in production, Vite in development

### Build Commands
- `npm run dev`: Development mode with hot reload
- `npm run build`: Production build for both frontend and backend
- `npm run start`: Production server startup
- `npm run db:push`: Database schema migration

The application is designed to handle police inspection workflows with specific requirements for Brazilian Civil Police operations, including proper Portuguese language support and compliance with internal procedures and reporting standards.

## Recent Changes
- **2025-08-07**: Sistema finalizado e pronto para deploy - todas as funcionalidades operacionais
- **2025-08-07**: Corrigido problema de geração de PDF na aba Status Regularização
- **2025-08-07**: Botões de atualização de status (regularizado/não regularizado/pendente) funcionando perfeitamente
- **2025-08-07**: Cache do React Query otimizado para atualizações em tempo real
- **2025-08-07**: jsPDF integrado via CDN para máxima compatibilidade
- **2025-08-06**: Galeria removida completamente do sistema conforme solicitado pelo usuário
- **2025-08-06**: Sistema otimizado sem funcionalidades de galeria para melhor performance  
- **2025-08-06**: Foco nas funcionalidades principais: Dashboard, Relatórios, Status Regularização e Administração
- **2025-08-06**: Renomeação de "Controle de Prazos" para "Status Regularização" conforme solicitado
- **2025-07-25**: Implemented restricted access system for administrative functions
- **2025-07-25**: Created dual-layer authentication: regular login + administrative password
- **2025-07-25**: Added secure Excel upload endpoint with authentication middleware
- **2025-07-25**: Administrative password: ASTEC@Admin#2025!BA (separate from login credentials)
- **2025-07-25**: New "Administração" tab with access control and audit logging
- **2025-07-25**: Excel processing with automatic date conversion and data validation
- **2025-07-25**: Session-based admin authentication (expires when browser closes)
- **2025-07-25**: Updated login credentials to: astec.admin / Correpol@2025#BA
- **2025-07-25**: Fixed "Total de Não Conformidades" label in reports (was showing "Total de Inspeções")
- **2025-07-25**: Implemented non-conformity filtering with dedicated PDF report generation
- **2025-07-22**: Final database configuration with updated source file: CONCLUSIVA 2 - PRAZO_1753225500658.xlsx  
- **2025-07-22**: System correctly processes 3,040 authentic non-conformity records from 1,100 unique inspections
- **2025-07-22**: Enhanced dashboard with values displayed on bar charts and improved visualizations  
- **2025-07-22**: System ready for production with authentic inspection data reflecting operational reality

## Department Codes
The system now uses the correct official department abbreviations:
- **DEPIN**: Departamento de Polícia do Interior
- **DEPOM**: Departamento de Polícia Metropolitana  
- **DENARC**: Departamento Especializado de Investigação e Repressão ao Narcotráfico
- **DPMCV**: Departamento de Proteção à Mulher, Cidadania e Pessoas Vulneráveis
- **DHPP**: Departamento de Homicídios e Proteção à Pessoa
- **DRACO**: Departamento de Repressão e Combate à Corrupção, ao Crime Organizado e à Lavagem de Dinheiro
- **DEIC**: Departamento Especializado de Investigações Criminais
- **GDG**: Gabinete do Delegado Geral