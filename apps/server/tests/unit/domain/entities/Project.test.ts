import { describe, expect, it } from "bun:test";
import { Project, type ProjectProps } from "../../../../src/domain/entities/Project";
import { Slug } from "../../../../src/domain/value-objects/Slug";

describe("Project Entity", () => {
  const validSlug = Slug.create("my-project");
  const validProps: ProjectProps = {
    id: "project-1",
    organizationId: "org-1",
    name: "My Project",
    slug: validSlug,
  };

  describe("Creation", () => {
    it("should create a project with all properties", () => {
      const project = new Project(validProps);
      
      expect(project.id).toBe(validProps.id);
      expect(project.organizationId).toBe(validProps.organizationId);
      expect(project.getName()).toBe(validProps.name);
      expect(project.getSlug()).toBe(validProps.slug.getValue());
      expect(project.createdAt).toBeInstanceOf(Date);
    });

    it("should initialize default values if not provided", () => {
      const project = new Project(validProps);
      
      const props = project.getProps();
      expect(props.settings).toEqual({});
      expect(props.createdAt).toBeInstanceOf(Date);
      expect(props.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw error if name is empty", () => {
      const invalidProps = { ...validProps, name: "" };
      expect(() => new Project(invalidProps)).toThrow("Project name cannot be empty");
    });
  });

  describe("Updates", () => {
    describe("Name", () => {
      it("should update name and refresh updatedAt", async () => {
        const project = new Project(validProps);
        const initialUpdatedAt = project.getProps().updatedAt!;
        
        await new Promise(resolve => setTimeout(resolve, 10));
        
        project.updateName("New Project Name");
        
        expect(project.getName()).toBe("New Project Name");
        expect(project.getProps().updatedAt!.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
      });

      it("should throw error when updating with empty name", () => {
        const project = new Project(validProps);
        expect(() => project.updateName("")).toThrow("Project name cannot be empty");
      });
    });

    describe("Settings", () => {
      it("should update settings and merge with existing ones", async () => {
        const propsWithSettings: ProjectProps = {
          ...validProps,
          settings: { theme: "dark", lang: "en" }
        };
        const project = new Project(propsWithSettings);
        const initialUpdatedAt = project.getProps().updatedAt!;
        
        await new Promise(resolve => setTimeout(resolve, 10));
        
        project.updateSettings({ theme: "light", notifications: true });
        
        const currentSettings = project.getSettings();
        expect(currentSettings).toEqual({
          theme: "light",
          lang: "en",
          notifications: true
        });
        expect(project.getProps().updatedAt!.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
      });
    });
  });

  describe("Data Access", () => {
    it("should return correct props via getProps", () => {
      const project = new Project(validProps);
      const props = project.getProps();
      
      expect(props.id).toBe(validProps.id);
      expect(props.name).toBe(validProps.name);
      expect(props.slug).toBe(validProps.slug);
    });

    it("should return correct name, slug and settings via dedicated methods", () => {
      const project = new Project({
        ...validProps,
        settings: { active: true }
      });
      
      expect(project.getName()).toBe("My Project");
      expect(project.getSlug()).toBe("my-project");
      expect(project.getSettings()).toEqual({ active: true });
    });
  });
});
