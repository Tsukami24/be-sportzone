# TODO: Implement Forgot Password Feature

## Steps
- [x] Install nodemailer and @types/nodemailer dependencies
- [x] Add email configuration to src/config/app.config.ts
- [x] Create OTP entity (src/auth/entities/otp.entity.ts)
- [x] Create email service (src/auth/email.service.ts)
- [x] Create forgot-password.dto.ts
- [x] Create verify-otp.dto.ts
- [x] Create reset-password.dto.ts
- [x] Add forgotPassword, verifyOtp, resetPassword methods to auth.service.ts
- [x] Add endpoints to auth.controller.ts
- [x] Update auth.module.ts to include email service and OTP entity
- [ ] Test the forgot password flow
