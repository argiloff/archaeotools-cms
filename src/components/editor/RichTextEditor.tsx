import { useEffect, useRef } from 'react';
import type EditorJS from '@editorjs/editorjs';

type Props = {
  value?: any;
  onChange?: (data: any) => void;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const holder = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const Editor = (await import('@editorjs/editorjs')).default;
      if (!isMounted || !holder.current) return;
      const editor = new Editor({
        holder: holder.current,
        data: value ?? { blocks: [] },
        placeholder: placeholder ?? 'Schreibe etwas…',
        onChange: async () => {
          if (onChange) {
            const data = await editor.save();
            onChange(data);
          }
        },
      });
      editorRef.current = editor;
    })();

    return () => {
      isMounted = false;
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [onChange, placeholder, value]);

  return <div className="rich-editor" ref={holder} />;
}
