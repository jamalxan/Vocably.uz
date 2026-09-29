import { BLOG_POSTS } from '@/lib/blogPosts';
import { IELTS_GUIDES } from '@/lib/seo/ieltsGuides';
import { SITE_URL, SITE_SUMMARY_EN } from '@/lib/seo/site';

// llms-full.txt (llmstxt.org convention): the full text of the public guides
// and articles in one plain-markdown file, so an AI assistant can read and
// cite Vocably's content without crawling every page.
export const dynamic = 'force-static';

export function GET() {
  const guides = IELTS_GUIDES.map(
    (g) =>
      `# ${g.title}\n\nURL: ${SITE_URL}/ielts/${g.slug}\n\n${g.description}\n\n${g.facts.map(([k, v]) => `- ${k}: ${v}`).join('\n')}\n\n${g.body}\n\n## FAQ\n\n${g.faq.map(([q, a]) => `**${q}**\n${a}`).join('\n\n')}`
  );
  const posts = BLOG_POSTS.map((p) => `# ${p.title}\n\nURL: ${SITE_URL}/blog/${p.slug}\nPublished: ${p.date}\n\n${p.content}`);
  const body = `# Vocably — full content\n\n> ${SITE_SUMMARY_EN}\n\nLanguage of the articles: Uzbek (Latin script).\n\n---\n\n${[...guides, ...posts].join('\n\n---\n\n')}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
