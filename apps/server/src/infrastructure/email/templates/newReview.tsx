import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface NewReviewEmailProps {
  formName: string;
  formId: string;
  authorName: string;
  adminUrl: string;
}

export const NewReviewEmail = ({
  formName,
  formId,
  authorName,
  adminUrl,
}: NewReviewEmailProps) => {
  return (
    <Html dir="ltr" lang="en">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Inter"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
      <Preview>New review from {authorName} on {formName}</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src="https://reviewskits.com/assets/reviewskits.svg"
              alt="Reviewskits"
              width="48"
              height="48"
              style={logo}
            />
          </Section>

          {/* Heading */}
          <Heading style={h1}>You have a new review.</Heading>

          {/* Intro */}
          <Text style={paragraph}>
            <strong>{authorName}</strong> just submitted a review on your form{" "}
            <strong>&quot;{formName}&quot;</strong>. Head over to your dashboard
            to read it, moderate it, or pin it to your collection.
          </Text>

          <Text style={paragraph}>
            Each review is an opportunity to understand how your users experience
            your product. Taking the time to review each submission helps you
            build a trustworthy, curated showcase that converts visitors into customers.
          </Text>

          <Hr style={hr} />

          <Text style={paragraph}>
            From your dashboard, you can approve or reject the review, add it to
            a featured collection, or export it for use in your marketing materials.
            Reviewskits gives you full ownership over your review data — no lock-in,
            no black boxes.
          </Text>

          <Text style={paragraph}>
            If this review comes from a genuine customer, approving it quickly
            signals responsiveness and care. If it needs follow-up, your dashboard
            lets you flag it for later review.
          </Text>

          {/* CTA */}
          <Section style={buttonSection}>
            <Button style={button} href={`${adminUrl}/forms/${formId}`}>
              View review in dashboard
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Text style={footer}>
            © {new Date().getFullYear()} Reviewskits. All rights reserved.
          </Text>
          <Text style={footer}>
            You received this email because you own this form on Reviewskits.
            To stop receiving notifications, remove your SMTP configuration.
          </Text>

        </Container>
      </Body>
    </Html>
  );
};

export default NewReviewEmail;

// ─── Styles ──────────────────────────────────────────────────

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    'Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 0 60px",
  maxWidth: "560px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logo = {
  display: "block",
  outline: "none",
  border: "none",
  textDecoration: "none",
  margin: "0 auto",
};

const h1 = {
  color: "#000000",
  fontSize: "32px",
  fontWeight: "bold" as const,
  textAlign: "center" as const,
  margin: "30px 0",
  letterSpacing: "-0.02em",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "26px",
  color: "#333333",
  margin: "0 0 20px",
};

const hr = {
  width: "100%",
  border: "none",
  borderTop: "1px solid #eaeaea",
  borderColor: "#eaeaea",
  margin: "32px 0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "40px 0 20px",
};

const button = {
  backgroundColor: "#0D9E75",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 32px",
};

const footer = {
  fontSize: "12px",
  lineHeight: "24px",
  color: "#cccccc",
  textAlign: "center" as const,
  margin: "0",
};
