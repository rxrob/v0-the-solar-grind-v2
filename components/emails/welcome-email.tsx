import { process } from "process"

// Simple HTML email template - no React Email components to avoid h.getOwner error
export const createWelcomeEmailHTML = (name: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #f97316; font-size: 24px; margin: 0;">Solar Grind</h1>
  </div>
  
  <h1 style="color: #333; font-size: 24px; text-align: center; margin: 40px 0;">Welcome to Solar Grind!</h1>
  
  <p style="color: #333; font-size: 16px; line-height: 26px;">Hi ${name},</p>
  
  <p style="color: #333; font-size: 16px; line-height: 26px;">
    Welcome to Solar Grind, the professional solar analysis platform trusted by thousands of solar installers and energy consultants worldwide.
  </p>
  
  <p style="color: #333; font-size: 16px; line-height: 26px;">With your new account, you can:</p>
  
  <ul style="color: #333; font-size: 16px; line-height: 26px; padding-left: 20px;">
    <li style="margin: 8px 0;">Calculate accurate solar system sizes</li>
    <li style="margin: 8px 0;">Generate detailed professional reports</li>
    <li style="margin: 8px 0;">Analyze site conditions and shading</li>
    <li style="margin: 8px 0;">Access NREL PVWatts integration</li>
    <li style="margin: 8px 0;">Export data for client presentations</li>
  </ul>
  
  <div style="text-align: center; margin: 32px 0;">
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" 
       style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
      Get Started
    </a>
  </div>
  
  <p style="color: #333; font-size: 16px; line-height: 26px;">
    If you have any questions or need help getting started, don't hesitate to reach out to our support team.
  </p>
  
  <hr style="border-color: #cccccc; margin: 32px 0;">
  
  <p style="color: #8898aa; font-size: 14px; line-height: 22px;">
    Best regards,<br>
    The Solar Grind Team
  </p>
  
  <p style="color: #8898aa; font-size: 14px; line-height: 22px;">
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="color: #f97316; text-decoration: underline;">Solar Grind</a> - Professional Solar Analysis Platform
  </p>
</div>
`
