import { describe, expect, it } from "bun:test";
import { Form, type FormProps } from "../../../../src/domain/entities/Form";
import { Slug } from "../../../../src/domain/value-objects/Slug";

describe("Form Entity", () => {
  const validSlug = Slug.create("contact-form");
  const validProps: FormProps = {
    id: "form-1",
    projectId: "project-1",
    name: "Contact Form",
    slug: validSlug,
  };

  describe("Creation", () => {
    it("should create a form with all properties", () => {
      const form = new Form(validProps);
      
      expect(form.id).toBe(validProps.id);
      expect(form.projectId).toBe(validProps.projectId);
      expect(form.getName()).toBe(validProps.name);
      expect(form.getSlug()).toBe(validProps.slug.getValue());
      expect(form.createdAt).toBeInstanceOf(Date);
    });

    it("should initialize default values if not provided", () => {
      const form = new Form(validProps);
      
      const props = form.getProps();
      expect(props.isActive).toBe(true);
      expect(props.config).toEqual({});
      expect(props.createdAt).toBeInstanceOf(Date);
      expect(props.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw error if name is empty", () => {
      const invalidProps = { ...validProps, name: "" };
      expect(() => new Form(invalidProps)).toThrow("Form name cannot be empty");
    });
  });

  describe("Behavior", () => {
    describe("Status Toggle", () => {
      it("should toggle isActive status and refresh updatedAt", async () => {
        const form = new Form(validProps);
        const initialUpdatedAt = form.getProps().updatedAt!;
        
        expect(form.getIsActive()).toBe(true);
        
        await new Promise(resolve => setTimeout(resolve, 10));
        
        form.toggleActive();
        expect(form.getIsActive()).toBe(false);
        expect(form.getProps().updatedAt!.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
        
        form.toggleActive();
        expect(form.getIsActive()).toBe(true);
      });
    });

    describe("Name Update", () => {
      it("should update name and refresh updatedAt", async () => {
        const form = new Form(validProps);
        const initialUpdatedAt = form.getProps().updatedAt!;
        
        await new Promise(resolve => setTimeout(resolve, 10));
        
        form.updateName("Support Form");
        
        expect(form.getName()).toBe("Support Form");
        expect(form.getProps().updatedAt!.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
      });

      it("should throw error when updating with empty name", () => {
        const form = new Form(validProps);
        expect(() => form.updateName("")).toThrow("Form name cannot be empty");
      });
    });

    describe("Config Update", () => {
      it("should update config and merge with existing ones", async () => {
        const propsWithConfig: FormProps = {
          ...validProps,
          config: { showLogo: true, primaryColor: "#000" }
        };
        const form = new Form(propsWithConfig);
        const initialUpdatedAt = form.getProps().updatedAt!;
        
        await new Promise(resolve => setTimeout(resolve, 10));
        
        form.updateConfig({ primaryColor: "#fff", submissionLimit: 100 });
        
        const props = form.getProps();
        expect(props.config).toEqual({
          showLogo: true,
          primaryColor: "#fff",
          submissionLimit: 100
        });
        expect(props.updatedAt!.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
      });
    });
  });

  describe("Data Access", () => {
    it("should return correct props via getProps", () => {
      const form = new Form(validProps);
      const props = form.getProps();
      
      expect(props.id).toBe(validProps.id);
      expect(props.name).toBe(validProps.name);
      expect(props.slug).toBe(validProps.slug);
    });

    it("should return correct values via getters", () => {
      const form = new Form(validProps);
      expect(form.getName()).toBe("Contact Form");
      expect(form.getSlug()).toBe("contact-form");
      expect(form.getIsActive()).toBe(true);
    });
  });
});
