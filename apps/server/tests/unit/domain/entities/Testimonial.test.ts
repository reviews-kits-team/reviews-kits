import { describe, expect, it } from "bun:test";
import { Testimonial, type TestimonialProps } from "../../../../src/domain/entities/Testimonial";
import { Rating } from "../../../../src/domain/value-objects/Rating";
import { Email } from "../../../../src/domain/value-objects/Email";

describe("Testimonial Entity", () => {
  const validProps: TestimonialProps = {
    id: "test-1",
    projectId: "project-1",
    formId: "form-1",
    content: "This is a great product!",
    authorName: "Jane Doe",
  };

  describe("Creation", () => {
    it("should create a testimonial with all minimal properties", () => {
      const testimonial = new Testimonial(validProps);
      
      expect(testimonial.id).toBe(validProps.id);
      expect(testimonial.projectId).toBe(validProps.projectId);
      expect(testimonial.getProps().content).toBe(validProps.content);
      expect(testimonial.getProps().authorName).toBe(validProps.authorName);
      expect(testimonial.createdAt).toBeInstanceOf(Date);
    });

    it("should initialize default values if not provided", () => {
      const testimonial = new Testimonial(validProps);
      
      const props = testimonial.getProps();
      expect(props.status).toBe("pending");
      expect(props.source).toBe("form");
      expect(props.metadata).toEqual({});
      expect(props.createdAt).toBeInstanceOf(Date);
      expect(props.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw error if content is empty", () => {
      const invalidProps = { ...validProps, content: "" };
      expect(() => new Testimonial(invalidProps)).toThrow("Testimonial content cannot be empty");
    });

    it("should throw error if authorName is empty", () => {
      const invalidProps = { ...validProps, authorName: "" };
      expect(() => new Testimonial(invalidProps)).toThrow("Testimonial author name cannot be empty");
    });

    it("should throw error if projectId is empty", () => {
      const invalidProps = { ...validProps, projectId: "" };
      expect(() => new Testimonial(invalidProps)).toThrow("Testimonial project ID cannot be empty");
    });

    describe("FormId Validation Logic", () => {
      it("should throw error if source is 'form' and formId is missing", () => {
        const { formId, ...propsWithoutFormId } = validProps;
        expect(() => new Testimonial(propsWithoutFormId)).toThrow("Testimonial from form source must have a form ID");
      });

      it("should allow missing formId if source is 'import'", () => {
        const { formId, ...propsWithoutFormId } = validProps;
        const importProps: TestimonialProps = {
          ...propsWithoutFormId,
          source: 'import'
        };
        
        expect(() => new Testimonial(importProps)).not.toThrow();
        const testimonial = new Testimonial(importProps);
        expect(testimonial.getProps().source).toBe('import');
      });
    });
  });

  describe("Workflow", () => {
    it("should approve testimonial and refresh updatedAt", async () => {
      const testimonial = new Testimonial(validProps);
      const initialUpdatedAt = testimonial.getProps().updatedAt!;
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      testimonial.approve();
      
      expect(testimonial.getStatus()).toBe("approved");
      expect(testimonial.getProps().updatedAt!.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
    });

    it("should reject testimonial and refresh updatedAt", async () => {
      const testimonial = new Testimonial(validProps);
      const initialUpdatedAt = testimonial.getProps().updatedAt!;
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      testimonial.reject();
      
      expect(testimonial.getStatus()).toBe("rejected");
      expect(testimonial.getProps().updatedAt!.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
    });
  });

  describe("Updates", () => {
    it("should update content and refresh updatedAt", async () => {
      const testimonial = new Testimonial(validProps);
      const initialUpdatedAt = testimonial.getProps().updatedAt!;
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      testimonial.updateContent("Updated content");
      
      expect(testimonial.getProps().content).toBe("Updated content");
      expect(testimonial.getProps().updatedAt!.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
    });

    it("should throw error when updating with empty content", () => {
      const testimonial = new Testimonial(validProps);
      expect(() => testimonial.updateContent("")).toThrow("Testimonial content cannot be empty");
    });
  });

  describe("Value Objects Integration", () => {
    it("should correctly handle Rating and Email VOs", () => {
      const rating = Rating.create(5);
      const email = Email.create("test@example.com");
      
      const propsWithVOs: TestimonialProps = {
        ...validProps,
        rating,
        authorEmail: email
      };
      
      const testimonial = new Testimonial(propsWithVOs);
      
      expect(testimonial.getRatingValue()).toBe(5);
      expect(testimonial.getAuthorEmailValue()).toBe("test@example.com");
    });

    it("should return undefined if Rating or Email are not provided", () => {
      const testimonial = new Testimonial(validProps);
      
      expect(testimonial.getRatingValue()).toBeUndefined();
      expect(testimonial.getAuthorEmailValue()).toBeUndefined();
    });
  });
});
