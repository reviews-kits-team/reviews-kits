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

The Moderation Dashboard provides a rapid interface to triage your reviews. The primary actions highlighted are:
1. **CSV Export**: Instantly export your current dataset to CSV for external analysis or backups.
2. **Status Triage**: Quickly approve or reject new customer feedback right from the main view.

![Reviews Moderation Dashboard](/images/reviews_moderation.png)

From the dashboard, you can also:
- **Search**: Find specific reviews by author name or content.
- **Edit**: Correct minor typos or clean up formatting.
- **Feature**: (Enterprise) Pin specific reviews to the top of your feeds.
- **Delete**: Permanently remove testimonials from your database.

---

## Importing Reviews

You don't have to start from scratch. Reviewskits allows you to seamlessly migrate your existing social proof from other platforms. You can directly import your testimonials from **Senja**, **Trustpilot**, or by uploading a generic **CSV** or **JSON** file.

![Import your reviews](/images/import_your_reviews_from_senja_trustpilot_jsonfile_csvfile.png)

---

## Security & RBAC

Moderation actions require **Admin** permissions and a valid Secret Key (`sk_`). This ensures that only authorized team members can change the status of your reviews.
