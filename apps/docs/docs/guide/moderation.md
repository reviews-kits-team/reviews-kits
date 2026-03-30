# Moderation

The **Moderation Dashboard** is the nerve center of Reviewskits. It's where you maintain the quality and authenticity of your social proof.

---

## The Approval Flow

Reviewskits follows a "Review First" philosophy. No testimonial is displayed publicly until it has been vetted by an administrator.

### Statuses
- **Pending**: New submissions arrive here first. They are not visible via the public API.
- **Approved**: Once approved, testimonials are immediately available via the `useReviews` SDK hook and the public API.
- **Rejected**: Testimonials that are spam or inappropriate can be rejected to keep them out of your analytics and feeds.

---

## Managing Testimonials

From the dashboard, you can:
- **Search**: Find specific reviews by author name or content.
- **Edit**: Correct minor typos or clean up formatting.
- **Feature**: (Enterprise) Pin specific reviews to the top of your feeds.
- **Delete**: Permanently remove testimonials from your database.

---

## Security & RBAC

Moderation actions require **Admin** permissions and a valid Secret Key (`sk_`). This ensures that only authorized team members can change the status of your reviews.
