// Import utilities from `astro:content`
import { defineCollection, z } from "astro:content";
// Define a `type` and `schema` for each collection
const postsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    author: z.string(),
    image: z.object({
      url: z.string(),
      alt: z.string(),
    }).optional(),
    tags: z.array(z.string()),
  }),
});

const projectsCollection = defineCollection({
  type: "data",
  schema: z.object({
    id: z.number(),
    date: z.number(),
    name: z.string(),
    description: z.string(),
    url: z.string(),
    image: z.object({
      url: z.string(),
      alt: z.string(),
    }),
  }),
});

const jobsCollection = defineCollection({
  type: "data",
  schema: z.object({
    image: z.object({
      url: z.string(),
      alt: z.string(),
    }),
    name: z.string(),
    url: z.string(),
    date: z.string(),
    title: z.string(),
  }),
});

// Export a single `collections` object to register your collection(s)
export const collections = {
  posts: postsCollection,
  projects: projectsCollection,
  jobs: jobsCollection
};
