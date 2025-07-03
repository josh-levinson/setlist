# Password Reset Functionality

This document explains how the password reset functionality works in the Setlist app.

## How it Works

1. **Request Reset**: Users can click "Forgot Password?" on the login screen to request a password reset
2. **Email Sent**: The app sends a password reset email via Supabase Auth
3. **Click Link**: Users click the link in their email which contains a recovery token
4. **Token Verification**: The recovery token is verified and the user is automatically signed in
5. **Reset Password**: Users are taken to `/auth/reset-password` where they can enter a new password
6. **Success**: After successful password update, users are redirected to sign in with their new password

## Routes

- `/auth/reset-password` - The page where users can enter their new password
- The reset link in emails points to: `https://your-domain.com/auth/callback?token=...&type=recovery`

## Components

- `ResetPasswordForm` - Form for requesting password reset (in Auth component)
- `ResetPasswordPage` - Page for setting new password after clicking email link
- `AuthContext.resetPassword()` - Function to send reset email

## Security

- Recovery tokens are validated before allowing password changes
- Passwords must be at least 6 characters long
- Invalid or expired tokens show appropriate error messages
- Users are automatically signed in after successful token verification
- After password reset, users are redirected to sign in with their new password

## Flow Details

1. **Token Verification**: When users click the reset link, the recovery token is verified using `supabase.auth.verifyOtp()`
2. **Automatic Sign-in**: Upon successful verification, the user is automatically signed in
3. **Password Update**: The user can then update their password using `supabase.auth.updateUser()`
4. **Redirect to Login**: After successful password update, users are redirected to the login page to sign in with their new password

## Deployment Configuration

### Vercel Configuration

The app includes a `vercel.json` file that handles client-side routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures that all routes (including `/auth/reset-password`) are properly handled by the React Router.

## Testing

To test the password reset flow:

1. Go to the login page
2. Click "Forgot Password?"
3. Enter your email address
4. Check your email for the reset link
5. Click the link to go to the reset password page
6. Enter a new password and confirm it
7. You should be redirected to the login page to sign in with your new password

## Troubleshooting

### 404 Error on Reset Password Link

If you get a 404 error when clicking the reset password link:

1. **Check Vercel Configuration**: Ensure the `vercel.json` file is deployed with your app
2. **Verify Route**: Make sure the route `/auth/reset-password` is accessible
3. **Deploy Changes**: After adding the `vercel.json` file, redeploy your app
4. **Check URL**: Ensure the reset link URL matches your deployed domain exactly

### Other Issues

If the reset link doesn't work:

1. Make sure you're using the exact link from the email
2. Check that the link hasn't expired (usually 24 hours)
3. Try requesting a new reset link
4. Ensure your Supabase configuration is correct
5. Check browser console for any JavaScript errors

### Local Development

To test locally:

1. Run `bun run dev`
2. Navigate to `http://localhost:5173/auth/reset-password`
3. The page should load without errors (if you have a valid session)

## Route Structure

The app now properly handles auth routes outside of the authenticated section:

- `/auth/callback` - Handles OAuth callbacks and recovery token verification
- `/auth/reset-password` - Handles password reset (requires authentication)
- All other routes require authentication
