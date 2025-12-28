"use client";

import { useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { toast } from 'react-toastify';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function QuillEditor({ value, onChange, placeholder, className }: QuillEditorProps) {
  const quillRef = useRef<any>(null);

  // Custom image upload handler
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image too large. Maximum size is 5MB.');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid file type. Only images are allowed.');
        return;
      }

      // Show loading toast
      const toastId = toast.loading('Uploading image...');

      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/admin/images/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        const imageUrl = data.url;

        // Insert image into editor
        const quill = quillRef.current;
        if (quill) {
          const editor = quill.getEditor();
          const range = editor.getSelection();
          editor.insertEmbed(range?.index || 0, 'image', imageUrl);
          editor.setSelection((range?.index || 0) + 1);
        }

        toast.update(toastId, {
          render: 'Image uploaded successfully',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
      } catch (error) {
        console.error('Image upload error:', error);
        toast.update(toastId, {
          render: 'Failed to upload image',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        });
      }
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['blockquote', 'code-block'],
        ['clean']
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), [imageHandler]);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'color', 'background',
    'align',
    'link', 'image', 'video',
    'blockquote', 'code-block'
  ];

  return (
    <div className={className}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-background"
        // @ts-ignore - ref type issue with dynamic import
        ref={quillRef}
      />
      <style jsx global>{`
        .quill {
          background: transparent;
        }
        .ql-toolbar {
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem 0.5rem 0 0;
          background: hsl(var(--muted) / 0.5);
        }
        .ql-container {
          border: 1px solid hsl(var(--border));
          border-radius: 0 0 0.5rem 0.5rem;
          background: hsl(var(--background));
          min-height: 200px;
        }
        .ql-editor {
          min-height: 200px;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
      `}</style>
    </div>
  );
}
