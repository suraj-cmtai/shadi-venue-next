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
    // Personalized welcome messages based on role
    const getWelcomeMessage = (role: string, name: string) => {
      switch (role) {
        case 'user':
          return `Dear ${name},\n\nWelcome to your wedding journey with Shadi Venue! Your account has been created successfully. Get ready to explore stunning venues and plan your perfect day. Our platform offers everything you need to make your wedding dreams come true.`;
        case 'hotel':
          return `Dear ${name},\n\nWelcome to Shadi Venue as our valued Hotel Partner! Your account has been created successfully. You're now ready to showcase your stunning venue to countless couples planning their special day. Our platform will help you connect with the perfect clients.`;
        case 'vendor':
          return `Dear ${name},\n\nWelcome to Shadi Venue as a Wedding Service Provider! Your account has been created successfully. You're now part of our exclusive network of wedding professionals. Get ready to showcase your services to engaged couples and grow your business.`;
        case 'blog':
          return `Dear ${name},\n\nWelcome to Shadi Venue as our Content Creator! Your account has been created successfully. You're now ready to share your wedding expertise and inspire couples with your unique insights. We're excited to see your creative contributions.`;
        case 'marketing':
          return `Dear ${name},\n\nWelcome to Shadi Venue's Marketing Team! Your account has been created successfully. You're now equipped to help couples discover their dream venues and connect with our amazing vendors. Let's create magical wedding connections together.`;
        default:
          return `Dear ${name},\n\nWelcome to Shadi Venue! Your account has been created successfully.`;
      }
    };

    const userText = `
${getWelcomeMessage(role, name)}

Login Details:
Email: ${email}
Password: ${password}
Role: ${role}

Best wishes,
The Shadi Venue Team
    `;

    // Good-looking HTML email (responsive, modern, with branding colors)
    // Role-specific content
    const getRoleContent = (role: string) => {
      switch (role) {
        case 'user':
          return {
            emoji: '💝',
            title: 'Welcome to Your Wedding Journey!',
            subtitle: 'Your dream wedding planning starts here',
            message: 'Get ready to explore stunning venues and create your perfect wedding day.',
            ctaText: 'Start Planning Your Wedding'
          };
        case 'hotel':
          return {
            emoji: '🏰',
            title: 'Welcome, Venue Partner!',
            subtitle: 'Your venue showcase awaits',
            message: 'Start showcasing your stunning venue to couples planning their special day.',
            ctaText: 'Set Up Your Venue Profile'
          };
        case 'vendor':
          return {
            emoji: '✨',
            title: 'Welcome, Wedding Professional!',
            subtitle: 'Your services showcase awaits',
            message: 'Connect with engaged couples and grow your wedding business with us.',
            ctaText: 'Complete Your Profile'
          };
        case 'blog':
          return {
            emoji: '✍️',
            title: 'Welcome, Content Creator!',
            subtitle: 'Your creative platform is ready',
            message: 'Share your wedding expertise and inspire couples with your unique insights.',
            ctaText: 'Start Creating Content'
          };
        case 'marketing':
          return {
            emoji: '🎯',
            title: 'Welcome to the Marketing Team!',
            subtitle: 'Your marketing dashboard is ready',
            message: 'Help couples discover their dream venues and create magical connections.',
            ctaText: 'Access Marketing Dashboard'
          };
        default:
          return {
            emoji: '👋',
            title: 'Welcome to Shadi Venue!',
            subtitle: 'Your account is ready',
            message: 'Thank you for joining our platform.',
            ctaText: 'Get Started'
          };
      }
    };

    const roleContent = getRoleContent(role);

    const userHtml = `
      <div style="font-family: 'Segoe UI', 'Roboto', Arial, sans-serif; background: #fdf2f8; padding: 32px 0;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(236,72,153,0.07); overflow: hidden;">
          <div style="background: linear-gradient(90deg, #ec4899 0%, #f472b6 100%); padding: 32px 0 16px 0; text-align: center;">
            <img src="https://shadivenue.com/logo.svg" alt="Shadi Venue Logo" style="height: 48px; margin-bottom: 8px;" />
            <h1 style="margin: 0; font-size: 2rem; color: #fff; font-family: 'Cinzel', serif;">${roleContent.emoji} ${roleContent.title}</h1>
            <p style="color: #fdf2f8; font-size: 1.1rem; margin: 8px 0 0 0;">${roleContent.subtitle}</p>
          </div>
          <div style="padding: 32px 24px 24px 24px;">
            <p style="font-size: 1.05rem; color: #334155; margin-bottom: 18px;">
              Dear <span style="color: #ec4899; font-weight: 600;">${name}</span>,<br/>
              ${roleContent.message}
            </p>
            <div style="background: #fdf2f8; border-radius: 8px; padding: 18px 20px; margin-bottom: 18px;">
              <p style="margin: 0; color: #be185d; font-size: 1rem;">
                <strong>Email:</strong> <span style="color: #9d174d;">${email}</span><br/>
                <strong>Password:</strong> <span style="color: #9d174d;">${password}</span><br/>
                <strong>Role:</strong> <span style="color: #9d174d; text-transform: capitalize;">${role}</span>
              </p>
            </div>
            <a href="https://shadivenue.com/login" style="display: inline-block; background: linear-gradient(90deg, #ec4899 0%, #f472b6 100%); color: #fff; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 1.1rem; box-shadow: 0 2px 8px rgba(236,72,153,0.2); margin-bottom: 16px;">
              ${roleContent.ctaText}
            </a>
            <p style="font-size: 0.98rem; color: #64748b; margin-top: 24px;">
              If you did not sign up for this account, please ignore this email or contact us.
            </p>
            <hr style="border: none; border-top: 1px solid #fce7f3; margin: 24px 0;" />
            <p style="font-size: 0.95rem; color: #be185d; text-align: center;">
              We're excited to have you with us!<br/>
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

