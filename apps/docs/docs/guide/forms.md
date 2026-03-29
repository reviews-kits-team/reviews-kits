# Forms

Reviewskits uses **Forms** as the primary collection mechanism for testimonials. Each form is an independent entity with its own branding, fields, and public collection page.

---

## Collective Power

A form in Reviewskits is more than just a set of inputs. It's a professional storefront for your social proof.

### Key Features
- **Public Slugs**: Each form has a unique, customizable URL (e.g., `/f/alpha-launch`).
- **Custom Branding**: Upload your logo and choose colors to match your brand per form.
- **Fields**: Collect star ratings, text content, and author details (name, avatar, job title).
- **Redirection**: Send users to a custom URL after they submit a review.

---

## Lifecycle of a Form

1.  **Creation**: Use the Admin Dashboard to create a new form and set its slug.
2.  **Customization**: Add your questions, branding, and success message.
3.  **Share**: Distribute the public link via email, social media, or your website.
4.  **Auto-Collection**: Submissions are automatically recorded and sent to the **Moderation** queue.

---

## Technical Details

Forms are served via the public API at `/api/v1/forms/:slug`. When a customer submits a review, it is sent to `/api/v1/forms/:slug/submit`.

### Anti-Spam
Reviewskits implements rate-limiting and basic validation to prevent spam submissions on your public forms.
