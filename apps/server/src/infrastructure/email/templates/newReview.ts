interface NewReviewEmailData {
  formName: string;
  formId: string;
  authorName: string;
  rating?: number;
  content: string;
  adminUrl: string;
}

export function newReviewEmailHtml(data: NewReviewEmailData): string {
  const rating = data.rating ?? 0;
  const stars = data.rating
    ? Array.from({ length: 5 }, (_, i) =>
        `<span style="color:${i < rating ? '#0D9E75' : '#D1D5DB'}; font-size:20px;">★</span>`
      ).join('')
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New review received</title>
</head>
<body style="margin:0;padding:0;background-color:#F9FAFB;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9FAFB;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <span style="font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.5px;">
                reviewskits
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:24px;border:1px solid #E5E7EB;padding:40px 36px;">

              <!-- Badge -->
              <p style="margin:0 0 20px;display:inline-block;background:#ECFDF5;color:#0D9E75;font-size:13px;font-weight:600;padding:4px 12px;border-radius:9999px;">
                New review
              </p>

              <!-- Title -->
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;line-height:1.3;">
                ${escapeHtml(data.authorName)} left a review on <em style="font-style:normal;color:#0D9E75;">${escapeHtml(data.formName)}</em>
              </h1>

              <hr style="border:none;border-top:1px solid #F3F4F6;margin:24px 0;" />

              <!-- Stars -->
              ${stars ? `<p style="margin:0 0 12px;">${stars}</p>` : ''}

              <!-- Review content -->
              <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;white-space:pre-wrap;">${escapeHtml(data.content)}</p>

              <!-- CTA -->
              <a href="${data.adminUrl}/forms/${data.formId}"
                 style="display:inline-block;background:#0D9E75;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:12px;">
                View in dashboard
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;font-size:12px;color:#9CA3AF;">
              You received this email because you own this Reviewskits form.<br />
              To stop receiving notifications, remove your SMTP configuration.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
