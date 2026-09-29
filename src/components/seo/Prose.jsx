import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Markdown for public content pages (IELTS guides). Explicit utility classes —
// the typography plugin isn't installed. Mirrors the blog post styles.
const md = (Tag, className) => {
  function MdElement({ node, ...props }) {
    void node;
    return <Tag className={className} {...props} />;
  }
  return MdElement;
};

const COMPONENTS = {
  h2: md('h2', 'font-display text-2xl font-bold text-ink mt-10 mb-3 scroll-mt-24'),
  h3: md('h3', 'font-display text-lg font-bold text-ink mt-6 mb-2'),
  p: md('p', 'text-base text-ink leading-7 mb-4'),
  strong: md('strong', 'font-semibold text-ink'),
  a: md('a', 'text-accent underline underline-offset-2 hover:text-accent-hover'),
  ul: md('ul', 'list-disc pl-6 text-base text-ink leading-7 space-y-1.5 mb-4'),
  ol: md('ol', 'list-decimal pl-6 text-base text-ink leading-7 space-y-1.5 mb-4'),
  li: md('li', 'pl-1'),
};

export default function Prose({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
      {children}
    </ReactMarkdown>
  );
}
