import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Img,
} from 'https://esm.sh/@react-email/components@0.0.22'
import * as React from 'https://esm.sh/react@18.3.1'

interface VerificationEmailProps {
  token_hash: string
  email_action_type: string
  redirect_to: string
  supabase_url: string
}

export const VerificationEmail = ({
  token_hash,
  email_action_type,
  redirect_to,
  supabase_url,
}: VerificationEmailProps) => {
  const verificationUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

  // Dynamic content based on email action type
  const getContent = () => {
    switch (email_action_type) {
      case 'recovery':
        return {
          preview: 'Reset your Edura password',
          heading: 'Password Reset Request 🔐',
          mainText: 'We received a request to reset your password for your Edura account.',
          instruction: 'Click the button below to reset your password. This link will expire in 1 hour for security reasons.',
          buttonText: 'Reset Password',
          disclaimer: 'If you didn\'t request a password reset, you can safely ignore this email. Your password will remain unchanged.',
          showFeatures: false,
        };
      case 'email_change':
        return {
          preview: 'Confirm your new email address',
          heading: 'Verify Your New Email Address 📧',
          mainText: 'You recently requested to change your email address for your Edura account.',
          instruction: 'To complete this change and confirm your new email address, please click the button below:',
          buttonText: 'Confirm New Email',
          disclaimer: 'If you didn\'t request this email change, please contact our support team immediately to secure your account.',
          showFeatures: false,
        };
      default: // signup/verification
        return {
          preview: 'Verify your Edura account',
          heading: 'Welcome to Edura! 🎓',
          mainText: 'Thank you for registering with Edura - your complete exam preparation platform.',
          instruction: 'To complete your registration and start accessing thousands of past questions, study materials, and practice exams, please verify your email address by clicking the button below:',
          buttonText: 'Verify Email Address',
          disclaimer: 'If you didn\'t create an account with Edura, you can safely ignore this email.',
          showFeatures: true,
        };
    }
  };

  const content = getContent();

  return (
    <Html>
      <Head />
      <Preview>{content.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={h1}>{content.heading}</Heading>
          </Section>
          
          <Text style={text}>
            {content.mainText}
          </Text>
          
          <Text style={text}>
            {content.instruction}
          </Text>
          
          <Section style={buttonContainer}>
            <Link
              href={verificationUrl}
              target="_blank"
              style={button}
            >
              {content.buttonText}
            </Link>
          </Section>
          
          <Text style={text}>
            Or copy and paste this link into your browser:
          </Text>
          
          <Text style={linkText}>
            {verificationUrl}
          </Text>
          
          {content.showFeatures ? (
            <Section style={featuresSection}>
              <Text style={featuresTitle}>What you'll get with Edura:</Text>
              <Text style={featureItem}>✓ Unlimited access to JAMB, WAEC, and NECO past questions</Text>
              <Text style={featureItem}>✓ AI-powered study assistant for personalized learning</Text>
              <Text style={featureItem}>✓ Detailed performance analytics and progress tracking</Text>
              <Text style={featureItem}>✓ Offline mode for studying anywhere, anytime</Text>
              <Text style={featureItem}>✓ Interactive CBT practice with real exam conditions</Text>
            </Section>
          ) : null}
          
          <Text style={footerText}>
            {content.disclaimer}
          </Text>
          
          <Text style={footer}>
            Best regards,<br />
            <strong>The Edura Team</strong><br />
            Your Partner in Academic Excellence
          </Text>
          
          <Text style={copyright}>
            © {new Date().getFullYear()} Edura. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default VerificationEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const logoSection = {
  padding: '32px 40px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #e6ebf1',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
  padding: '0',
}

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
}

const linkText = {
  color: '#6366f1',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
  wordBreak: 'break-all' as const,
}

const buttonContainer = {
  padding: '27px 0 27px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#6366f1',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const featuresSection = {
  padding: '32px 40px',
  backgroundColor: '#f8f9fa',
  margin: '32px 0',
  borderRadius: '8px',
}

const featuresTitle = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px 0',
}

const featureItem = {
  color: '#484848',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
}

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
  marginTop: '32px',
}

const footer = {
  color: '#484848',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
  marginTop: '16px',
}

const copyright = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  marginTop: '32px',
}
