export type TestimonialStatus = 'pending' | 'approved' | 'rejected';
export type TestimonialSource = "form" | "import" | "api";

export interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
}

export interface Testimonial {
    id: string
    content: string
    rating?: number
    status: TestimonialStatus
    source: TestimonialSource
    author: {
        name: string;
        email?: string;
        title?: string;
    }
    created_at: Date
}

export interface Form {
    id: string
    name: string
    slug: string
    is_active: boolean
    created_at: Date
}