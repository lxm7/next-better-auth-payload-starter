import type { CollectionConfig } from "payload";
import { isEditor, nobody } from "../access";

const KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

// Editorial reference data. The app's `todo.category_key` (in `neondb`) points
// here by `key`, with no foreign key across the two databases, so integrity is
// kept by the rules below rather than by Postgres: a key never changes once
// created, and a category is archived, never deleted. If categories ever
// become user-created, they move to the app database instead.
export const TodoCategories: CollectionConfig = {
  slug: "todo-categories",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "key", "color", "archived"],
  },
  access: {
    read: isEditor,
    create: isEditor,
    update: isEditor,
    delete: nobody,
  },
  fields: [
    {
      name: "key",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          "Stable identifier stored on todos, e.g. `work`. Lowercase letters, digits and hyphens. Cannot be changed after creation.",
      },
      // Writable on create, read-only after: renaming a key would orphan every
      // todo that references it.
      access: {
        update: () => false,
      },
      validate: (value: string | null | undefined) =>
        (value && KEY_PATTERN.test(value)) ||
        "Use lowercase letters, digits and single hyphens, e.g. `side-project`.",
    },
    {
      name: "name",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "color",
      type: "text",
      admin: {
        description: "Hex colour, e.g. #2563eb. Optional.",
      },
      validate: (value: string | null | undefined) =>
        !value ||
        HEX_COLOR_PATTERN.test(value) ||
        "Use a six-digit hex colour, e.g. #2563eb.",
    },
    {
      name: "archived",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description:
          "Hides the category from new todos. Existing todos keep it.",
      },
    },
  ],
};
