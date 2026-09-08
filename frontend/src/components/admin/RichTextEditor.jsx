import { useRef, useEffect } from "react";
import { Bold, Italic, List, ListOrdered, Link2 } from "lucide-react";

// A lightweight contentEditable-based rich text editor — no heavy dependency
// (react-quill/tiptap) pulled in just for this. Stores/returns HTML string.
const RichTextEditor = ({ value, onChange }) => {
  const ref = useRef(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (ref.current && !isInternalChange.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
    isInternalChange.current = false;
  }, [value]);

  const exec = (command, arg) => {
    document.execCommand(command, false, arg);
    ref.current?.focus();
    handleInput();
  };

  const handleInput = () => {
    isInternalChange.current = true;
    onChange(ref.current.innerHTML);
  };

  const handleLink = () => {
    const url = prompt("Enter URL");
    if (url) exec("createLink", url);
  };

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden">
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <ToolbarButton onClick={() => exec("bold")} icon={Bold} label="Bold" />
        <ToolbarButton onClick={() => exec("italic")} icon={Italic} label="Italic" />
        <ToolbarButton onClick={() => exec("insertUnorderedList")} icon={List} label="Bullet list" />
        <ToolbarButton onClick={() => exec("insertOrderedList")} icon={ListOrdered} label="Numbered list" />
        <ToolbarButton onClick={handleLink} icon={Link2} label="Link" />
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={handleInput}
        className="min-h-[140px] px-4 py-3 text-sm focus:outline-none prose-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-600 [&_a]:underline"
        suppressContentEditableWarning
      />
    </div>
  );
};

const ToolbarButton = ({ onClick, icon: Icon, label }) => (
  <button type="button" onClick={onClick} title={label} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
    <Icon size={15} />
  </button>
);

export default RichTextEditor;
