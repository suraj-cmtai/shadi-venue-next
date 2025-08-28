import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// api/routes/welcome/route.ts

/**
 * API route to send a welcome email to a newly registered user for the Shadi Venue project.
 * Expects a POST request with JSON body: { name, email, role, password }
 * Sends a styled HTML welcome email with login credentials and role.
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, email, role, password } = data;

    // Validate required fields
    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Email content for the user
    const userTo = email;
    const userSubject = `🎉 Welcome to Shadi Venue, ${name}!`;
    const userText = `
Dear ${name},

Welcome to Shadi Venue! Your account has been created successfully.

Login Details:
Email: ${email}
Password: ${password}
Role: ${role}

You can now log in and start exploring the best venues for your special day.

Best wishes,
The Shadi Venue Team
    `;

    // Good-looking HTML email (responsive, modern, with branding colors)
    const userHtml = `
      <div style="font-family: 'Segoe UI', 'Roboto', Arial, sans-serif; background: #f8fafc; padding: 32px 0;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); overflow: hidden;">
          <div style="background: linear-gradient(90deg, #ffb347 0%, #ffcc80 100%); padding: 32px 0 16px 0; text-align: center;">
            <img src="https://shadivenue.com/logo.svg" alt="Shadi Venue Logo" style="height: 48px; margin-bottom: 8px;" />
            <h1 style="margin: 0; font-size: 2rem; color: #1e293b; font-family: 'Cinzel', serif;">Welcome, ${name}!</h1>
            <p style="color: #7c4700; font-size: 1.1rem; margin: 8px 0 0 0;">Your Shadi Venue account is ready 🎉</p>
          </div>
          <div style="padding: 32px 24px 24px 24px;">
            <p style="font-size: 1.05rem; color: #334155; margin-bottom: 18px;">
              Thank you for signing up with <span style="color: #ff9100; font-weight: 600;">Shadi Venue</span>.<br/>
              Here are your login details:
            </p>
            <div style="background: #fef3c7; border-radius: 8px; padding: 18px 20px; margin-bottom: 18px;">
              <p style="margin: 0; color: #b45309; font-size: 1rem;">
                <strong>Email:</strong> <span style="color: #7c4700;">${email}</span><br/>
                <strong>Password:</strong> <span style="color: #7c4700;">${password}</span><br/>
                <strong>Role:</strong> <span style="color: #7c4700; text-transform: capitalize;">${role}</span>
              </p>
            </div>
            <a href="https://shadivenue.com/login" style="display: inline-block; background: linear-gradient(90deg, #ff9100 0%, #ffb347 100%); color: #fff; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 1.1rem; box-shadow: 0 2px 8px rgba(255,145,0,0.08); margin-bottom: 16px;">
              Log In to Your Account
            </a>
            <p style="font-size: 0.98rem; color: #64748b; margin-top: 24px;">
              If you did not sign up for this account, please ignore this email or contact us.
            </p>
            <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
            <p style="font-size: 0.95rem; color: #a16207; text-align: center;">
              Wishing you a beautiful wedding journey!<br/>
              <span style="font-family: 'Dancing Script', cursive; font-size: 1.2rem;">Shadi Venue Team</span>
            </p>
          </div>
        </div>
      </div>
    `;

    // Setup nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
      },
    });

    // Send welcome email to user
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: userTo,
      subject: userSubject,
      text: userText,
      html: userHtml,
    });

    // Optionally, notify admin of new signup (optional, not required by prompt)
    // await transporter.sendMail({
    //   from: process.env.SMTP_FROM || process.env.SMTP_USER,
    //   to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
    //   subject: `New Shadi Venue Signup: ${name} (${role})`,
    //   text: `A new user has signed up:\nName: ${name}\nEmail: ${email}\nRole: ${role}`,
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

