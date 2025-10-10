import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('email.host'),
      port: this.configService.get('email.port'),
      secure: this.configService.get('email.secure'),
      auth: {
        user: this.configService.get('email.auth.user'),
        pass: this.configService.get('email.auth.pass'),
      },
    });
  }

  // Send Kode OTP to Email
  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('email.auth.user'),
      to: email,
      subject: 'Your OTP Code for Password Reset',
      text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
