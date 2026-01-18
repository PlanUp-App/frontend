import DOMPurify from "dompurify";

interface RichTextProps {
  html: string | null | undefined;
}

export function RichTextParser({ html }: RichTextProps) {
  if (!html) return null;

  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(html),
      }}
    />
  );
}
