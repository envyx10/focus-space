import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

// Raw HTML in a description is never rendered and javascript: URLs are stripped (react-markdown's defaults).
// Links open in a new tab, so the task view stays where it was.
const components: Components = {
  a: ({ node: _, ...p }) => <a {...p} target="_blank" rel="noopener noreferrer" />,
  img: ({ node: _, ...p }) => <img {...p} loading="lazy" />,
}

/** The description, formatted as GitHub-flavoured Markdown (tables, task lists, nested lists, images, highlighted code). */
export default function Markdown({ text }: { text: string }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  )
}
