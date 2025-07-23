import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: "blog",
        label: "Blog Posts",
        path: "src/content/blog",
        format: "mdx",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
            ui: {
              component: "textarea",
            },
          },
          {
            type: "datetime",
            name: "publishDate",
            label: "Publish Date",
            required: true,
          },
          {
            type: "datetime",
            name: "updatedDate",
            label: "Updated Date",
          },
          {
            type: "string",
            name: "author",
            label: "Author",
            options: ["Gokhan Turhan"],
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true,
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            options: [
              "general",
              "development",
              "crypto",
              "art",
              "culture",
              "finance",
              "technology",
              "philosophy",
            ],
          },
          {
            type: "boolean",
            name: "featured",
            label: "Featured",
          },
          {
            type: "boolean",
            name: "draft",
            label: "Draft",
          },
          {
            type: "number",
            name: "readingTime",
            label: "Reading Time (minutes)",
          },
          {
            type: "string",
            name: "excerpt",
            label: "Excerpt",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "originalUrl",
            label: "Original URL",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
            templates: [
              {
                name: "YouTubeEmbed",
                label: "YouTube Embed",
                fields: [
                  {
                    name: "videoId",
                    label: "Video ID",
                    type: "string",
                    required: true,
                  },
                ],
              },
              {
                name: "SpotifyEmbed",
                label: "Spotify Embed",
                fields: [
                  {
                    name: "trackId",
                    label: "Track ID",
                    type: "string",
                    required: true,
                  },
                ],
              },
              {
                name: "TwitterEmbed",
                label: "Twitter Embed",
                fields: [
                  {
                    name: "tweetId",
                    label: "Tweet ID",
                    type: "string",
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "art",
        label: "Art Pieces",
        path: "src/content/art",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
            ui: {
              component: "textarea",
            },
          },
          {
            type: "datetime",
            name: "createdDate",
            label: "Created Date",
            required: true,
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            options: ["digital", "generative", "data-viz", "interactive", "mixed-media"],
            required: true,
          },
          {
            type: "string",
            name: "medium",
            label: "Medium",
            required: true,
          },
          {
            type: "string",
            name: "dimensions",
            label: "Dimensions",
          },
          {
            type: "string",
            name: "tools",
            label: "Tools",
            list: true,
          },
          {
            type: "string",
            name: "colorTheme",
            label: "Color Theme",
            options: ["red", "green", "blue"],
            required: true,
          },
          {
            type: "boolean",
            name: "featured",
            label: "Featured",
          },
          {
            type: "image",
            name: "imageUrl",
            label: "Main Image",
            required: true,
          },
          {
            type: "image",
            name: "thumbnailUrl",
            label: "Thumbnail Image",
          },
          {
            type: "image",
            name: "galleryImages",
            label: "Gallery Images",
            list: true,
          },
          {
            type: "boolean",
            name: "available",
            label: "Available for Purchase",
          },
          {
            type: "string",
            name: "price",
            label: "Price",
          },
          {
            type: "string",
            name: "edition",
            label: "Edition",
          },
          {
            type: "string",
            name: "inspiration",
            label: "Inspiration",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "process",
            label: "Process",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "projects",
        label: "Projects",
        path: "src/content/projects",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "year",
            label: "Year",
            required: true,
          },
          {
            type: "string",
            name: "tech",
            label: "Technologies",
            list: true,
          },
          {
            type: "string",
            name: "link",
            label: "Project Link",
          },
          {
            type: "boolean",
            name: "featured",
            label: "Featured",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: "essays",
        label: "Essays",
        path: "src/content/essays",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
            ui: {
              component: "textarea",
            },
          },
          {
            type: "datetime",
            name: "publishDate",
            label: "Publish Date",
            required: true,
          },
          {
            type: "boolean",
            name: "draft",
            label: "Draft",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
});