
# Supabase Integration Guide

## Setup

1. Create a `.env` file based on `.env.example` with your Supabase credentials.

2. Install the Supabase CLI (optional for local development):
   ```bash
   npm install -g supabase
   ```

## Development Options

### Option 1: Use Hosted Supabase Project

1. Use the Supabase project URL and anon key in your `.env` file.
2. Run the application:
   ```bash
   npm run dev
   ```

### Option 2: Run Supabase Locally (for development)

1. Start Supabase locally:
   ```bash
   supabase start
   ```

2. Update your `.env` file with local Supabase credentials (shown after running `supabase start`).

3. Run the application:
   ```bash
   npm run dev
   ```

## Key Features

1. **Authentication**:
   - Protected routes using `<ProtectedRoute>` component
   - Role-specific access with `<AdminRoute>` component
   - Auth state management via Supabase auth hooks

2. **Resume Storage**:
   - File uploads to Supabase Storage
   - Support for file metadata and parsing

3. **Real-time Chat**:
   - Real-time message updates using Supabase Realtime
   - Message status tracking (read/unread)

4. **Admin Dashboard**:
   - CRUD operations for jobs, announcements, and reminders
   - Role-based access control

## Testing

1. **Authentication**:
   - Create a test user via signup form
   - Test protected routes access
   - Test admin vs. student role differences

2. **File Uploads**:
   - Test resume upload functionality
   - Verify file retrieval and metadata

3. **Real-time Features**:
   - Test chat between multiple users
   - Verify real-time notifications

## Troubleshooting

- Check browser console for errors
- Verify Supabase connection in Network tab
- Ensure proper environment variables are set
- Check Supabase dashboard for table/bucket permissions
