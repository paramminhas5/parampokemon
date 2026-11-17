// Drafts for Param's review. They render at /writing/<slug> with a "draft for review" banner,
// are noindex, and are left out of /writing, the sitemap and structured data.
// To publish one: move it into POSTS in lib/posts.ts (or delete `draft: true` handling for it).
// Series parts under review go here. The first-pass drafts were removed on 18 Nov 2026 at Param's request.
import type { Post } from "./posts";

export const DRAFTS: Post[] = [];
