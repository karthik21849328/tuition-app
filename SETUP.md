# Tuition Attendance System - Setup Guide

## Initial Admin Setup

To create the first admin user, follow these steps:

### Option 1: Using Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. Click "Add User"
4. Enter:
   - Email: `admin@tuition.com`
   - Password: `Admin@123`
   - Confirm password
   - Check "Auto Confirm User"
5. Click "Create User"
6. Copy the User ID
7. Go to Table Editor > profiles
8. Click "Insert" > "Insert row"
9. Enter:
   - id: [paste the User ID]
   - email: `admin@tuition.com`
   - role: `admin`
   - full_name: `System Administrator`
10. Click "Save"

### Option 2: Using SQL Editor

1. Go to Supabase Dashboard > SQL Editor
2. Run the following SQL (replace with your desired credentials):

```sql
-- This is a manual process as auth.users requires special handling
-- Follow Option 1 above for the easiest setup
```

## Default Login Credentials

After setup:
- **Email**: admin@tuition.com
- **Password**: Admin@123

**⚠️ Important**: Change these credentials immediately after first login!

## Application Features

### Admin Features
- Dashboard with statistics
- Student Management (Add, Edit, Delete)
- Batch Management
- Student-to-Batch Assignment
- Attendance Viewing and Analytics
- Automatic credential generation for students

### Student Features
- View assigned batch
- Mark daily attendance
- View attendance history
- View attendance percentage

## Email Configuration

The system includes an edge function for sending login credentials to students. To enable actual email sending:

1. Configure an email service (e.g., Resend, SendGrid, or AWS SES)
2. Update the edge function in `supabase/functions/send-credentials/index.ts`
3. Add your email service API key to Supabase Edge Function secrets

Currently, credentials are displayed in the browser alert after student creation.
