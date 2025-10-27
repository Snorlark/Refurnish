# Email Setup for 2FA

This guide explains how to set up email functionality for two-factor authentication (2FA) in the Refurnish application.

## Environment Variables

Add the following environment variables to your `.env` file in the `apps/api` directory:

```env
# Email Configuration for 2FA
EMAIL_USER=larksigmuondbabao@gmail.com
EMAIL_PASS=your-app-password-here
```

## Gmail Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `EMAIL_PASS` in your `.env` file

## Features Implemented

### 1. User Registration 2FA
- Sends OTP to user's email after registration
- User must verify email before account is fully activated

### 2. Admin Login 2FA
- Always requires OTP verification for admin login
- Sends OTP to `larksigmuondbabao@gmail.com`

### 3. Inactive User 2FA
- Users who haven't logged in for 1+ months require OTP verification
- Enhances security for dormant accounts

### 4. OTP Features
- 6-digit numeric codes
- 10-minute expiration
- 3 attempt limit per OTP
- Auto-cleanup of expired OTPs
- Rate limiting to prevent spam

## API Endpoints

- `POST /api/users/send-otp` - Send OTP to email
- `POST /api/users/verify-otp` - Verify OTP code
- `GET /api/users/check-last-login/:email` - Check if user needs 2FA

## Testing

1. Start the API server: `npm start`
2. Test registration with a new email
3. Test admin login with admin credentials
4. Test login with an old account (if available)

## Troubleshooting

- Ensure Gmail app password is correct
- Check that 2FA is enabled on Gmail account
- Verify environment variables are loaded correctly
- Check API server logs for email sending errors
