import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
interface NewReviewEmailProps {
  formName: string;
  formId: string;
  authorName: string;
  rating?: number;
  content: string;
  adminUrl: string;
}

export const NewReviewEmail = ({
  formName,
  formId,
  authorName,
  rating,
  content,
  adminUrl,
}: NewReviewEmailProps) => {
  const ratingValue = rating ?? 0;
  const stars = rating
    ? Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < ratingValue ? "#0D9E75" : "#D1D5DB", fontSize: "20px" }}>
          ★
        </span>
      ))
    : null;

  return (
    <Html>
      <Head />
      <Preview>New review from {authorName} on {formName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={logoSection}>
            <Text style={logoText}>reviewskits</Text>
          </Section>

          {/* Card */}
          <Section style={card}>
            {/* Badge */}
            <Text style={badge}>New review</Text>

            {/* Title */}
            <Heading style={h1}>
              {authorName} left a review on{" "}
              <span style={formNameHighlight}>{formName}</span>
            </Heading>

            <Hr style={hr} />

            {/* Stars */}
            {stars && <Text style={starsRow}>{stars}</Text>}

            {/* Review content */}
            <Text style={reviewContent}>{content}</Text>

            {/* CTA */}
            <Section style={buttonContainer}>
              <Button style={button} href={`${adminUrl}/forms/${formId}`}>
                View in dashboard
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Text style={footer}>
            You received this email because you own this Reviewskits form.
            <br />
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
  backgroundColor: "#F9FAFB",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 16px",
  maxWidth: "560px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const logoText = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#111827",
  letterSpacing: "-0.5px",
  margin: "0",
};

const card = {
  backgroundColor: "#ffffff",
  borderRadius: "24px",
  border: "1px solid #E5E7EB",
  padding: "40px 36px",
};

const badge = {
  display: "inline-block" as const,
  backgroundColor: "#ECFDF5",
  color: "#0D9E75",
  fontSize: "13px",
  fontWeight: "600",
  padding: "4px 12px",
  borderRadius: "9999px",
  margin: "0 0 20px",
};

const h1 = {
  color: "#111827",
  fontSize: "22px",
  fontWeight: "bold" as const,
  lineHeight: "1.3",
  margin: "0 0 8px",
};

const formNameHighlight = {
  color: "#0D9E75",
};

const hr = {
  borderColor: "#F3F4F6",
  margin: "24px 0",
};

const starsRow = {
  margin: "0 0 12px",
};

const reviewContent = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.7",
  whiteSpace: "pre-wrap" as const,
  margin: "0 0 28px",
};

const buttonContainer = {
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#0D9E75",
  borderRadius: "12px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 28px",
};

const footer = {
  textAlign: "center" as const,
  fontSize: "12px",
  color: "#9CA3AF",
  marginTop: "24px",
};
