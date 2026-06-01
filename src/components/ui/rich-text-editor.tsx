"use client"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Button } from "@/components/ui/button"
import {
    Bold,
    Italic,
    Heading2,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo
} from "lucide-react"
import { useEffect } from "react"

type EditorToolbarProps = {
    editor: Editor | null
}

const EditorToolbar = ({ editor }: EditorToolbarProps) => {
    if (!editor) return null

    return (
        <div className="flex flex-wrap gap-1 p-1.5 border-b bg-muted/20 items-center rounded-t-md">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${editor.isActive("bold") ? "bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 hover:text-emerald-500" : ""}`}
                onClick={() => editor.chain().focus().toggleBold().run()}
                title="Жирний"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${editor.isActive("italic") ? "bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 hover:text-emerald-500" : ""}`}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                title="Курсив"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${editor.isActive("heading", { level: 2 }) ? "bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 hover:text-emerald-500" : ""}`}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                title="Заголовок"
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${editor.isActive("bulletList") ? "bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 hover:text-emerald-500" : ""}`}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                title="Маркований список"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${editor.isActive("orderedList") ? "bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 hover:text-emerald-500" : ""}`}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                title="Нумерований список"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${editor.isActive("blockquote") ? "bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 hover:text-emerald-500" : ""}`}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                title="Цитата"
            >
                <Quote className="h-4 w-4" />
            </Button>
            <div className="flex-1 md:block hidden" />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Назад"
            >
                <Undo className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Вперед"
            >
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    )
}

type RichTextEditorProps = {
    value: string
    onChange: (value: string) => void
    disabled?: boolean
}

export function RichTextEditor({ value, onChange, disabled }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2],
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none min-h-[400px] p-4 focus:outline-none custom-scrollbar whitespace-pre-wrap overflow-y-auto max-h-[700px]",
            },
        },
        immediatelyRender: false,
    })

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value)
        }
    }, [value, editor])

    useEffect(() => {
        if (editor) {
            editor.setEditable(!disabled)
        }
    }, [disabled, editor])

    return (
        <div className="w-full rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring focus-within:border-ring flex flex-col">
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}