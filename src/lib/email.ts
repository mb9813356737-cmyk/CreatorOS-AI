export interface EmailResult {
  success: boolean;
  fallback: boolean;
  otp?: string;
}

export async function sendOTPEmail(email: string, otp: string): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === "placeholder" || apiKey.includes("placeholder")) {
    console.log("\n========================================");
    console.log(`[EMAIL SIMULATOR] Verification OTP for ${email}: ${otp}`);
    console.log("To send real emails, set RESEND_API_KEY in your .env file.");
    console.log("========================================\n");
    return { success: true, fallback: true, otp };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "CreatorOS AI <onboarding@resend.dev>",
        to: [email],
        subject: "Verify your CreatorOS AI Account",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #7c3aed; text-align: center;">CreatorOS AI</h2>
            <p>Welcome! Thank you for signing up. Please verify your email address to activate your account.</p>
            <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #7c3aed;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 12px; text-align: center;">This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend API email delivery failed:", errorText);
      // Fallback: log OTP to console so the user can still verify
      console.log("\n========================================");
      console.log(`[FALLBACK] Resend failed. OTP for ${email}: ${otp}`);
      console.log("========================================\n");
      return { success: true, fallback: true, otp };
    }

    console.log(`[Resend Email] Verification OTP sent successfully to ${email}`);
    return { success: true, fallback: false };
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    // Fallback: log OTP to console so the user can still verify
    console.log("\n========================================");
    console.log(`[FALLBACK] Email service error. OTP for ${email}: ${otp}`);
    console.log("========================================\n");
    return { success: true, fallback: true, otp };
  }
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationUrl: string
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === "placeholder" || apiKey.includes("placeholder")) {
    console.log("\n========================================");
    console.log(`[EMAIL SIMULATOR] Verification link for ${name} (${email}):`);
    console.log(`${verificationUrl}`);
    console.log("To send real emails, set RESEND_API_KEY in your .env file.");
    console.log("========================================\n");
    return { success: true, fallback: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "CreatorOS AI <onboarding@resend.dev>",
        to: [email],
        subject: "Verify your CreatorOS AI Account",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #6366f1; text-align: center;">CreatorOS AI</h2>
            <p>Hi ${name || "Creator"},</p>
            <p>Thank you for signing up for CreatorOS AI! Please verify your email address to activate your account and start generating viral content.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(to right, #6366f1, #22d3ee); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="color: #64748b; font-size: 12px; text-align: center;">If the button above does not work, copy and paste the link below into your browser:</p>
            <p style="color: #6366f1; font-size: 11px; text-align: center; word-break: break-all;">${verificationUrl}</p>
            <p style="color: #64748b; font-size: 12px; text-align: center;">This link will expire in 24 hours.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend API email delivery failed:", errorText);
      console.log("\n========================================");
      console.log(`[FALLBACK] Verification link for ${name} (${email}):`);
      console.log(`${verificationUrl}`);
      console.log("========================================\n");
      return { success: true, fallback: true };
    }

    console.log(`[Resend Email] Verification link sent successfully to ${email}`);
    return { success: true, fallback: false };
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    console.log("\n========================================");
    console.log(`[FALLBACK] Verification link for ${name} (${email}):`);
    console.log(`${verificationUrl}`);
    console.log("========================================\n");
    return { success: true, fallback: true };
  }
}
