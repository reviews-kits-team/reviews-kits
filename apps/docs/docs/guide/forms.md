# Forms

Reviewskits uses **Forms** as the primary collection mechanism for testimonials. Each form is an independent entity with its own branding, fields, and public collection page.

---

## Collective Power

A form in Reviewskits is more than just a set of inputs. It's a professional storefront for your social proof.

### Key Features
- **Public Slugs**: Each form has a unique, customizable URL (e.g., `/f/alpha-launch`). You will often need this slug (also called a Form Key) to interface with our SDKs. You can retrieve it directly from the form's detail view in the dashboard.
  
  ![Where to find your Form Slug](/images/where_to_find_your_form_key.png)
- **Custom Branding**: Upload your logo and choose colors to match your brand per form.
- **Fields**: Collect star ratings, text content, and author details (name, avatar, job title).
- **Redirection**: Send users to a custom URL after they submit a review.

---

## Lifecycle of a Form

1.  **Creation**: Use the Admin Dashboard to create a new form and set its slug. The dashboard provides a simple and intuitive interface to quickly get your form up and running.
    
    ![Create New Form](/images/create_new_form.png)

2.  **Customization**: Add your questions, branding, and success message. The visual builder lets you customize exactly what respondents will see.
    
    ![Edit Form](/images/edit_form.png)
    
    You can easily drag and drop fields or even add new logical steps to fit your specific workflow and data collection needs.
    
    ![Add New Step to Form](/images/add_new_step_to_form.png)

3.  **Share**: Distribute the public link via email, social media, or your website.
4.  **Auto-Collection**: Submissions are automatically recorded and sent to the **Moderation** queue.

---

## Technical Details

Forms are served via the public API at `/api/v1/forms/:slug`. When a customer submits a review, it is sent to `/api/v1/forms/:slug/submit`.

### Anti-Spam
Reviewskits implements rate-limiting and basic validation to prevent spam submissions on your public forms.
