// components/MailEditor.tsx
"use client";

import { Editor } from "@tinymce/tinymce-react";

type Props = {
  value?: string;
  onChange?: (v: string) => void;
};

export default function MailEditor({ value, onChange }: Props) {
  return (
    <Editor
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_KEY}
      value={value}
      init={{
        height: 280,
        menubar: false,
        plugins: ["lists", "link", "table", "code"],
        toolbar:
          "undo redo | bold italic underline | bullist numlist | link table | code",
        content_style:
          "body { font-family: Arial, sans-serif; font-size: 14px }",
      }}
      onEditorChange={(content) => onChange?.(content)}
    />
  );
}
