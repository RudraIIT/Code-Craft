// import { useRef,useEffect } from "react";
// import * as monaco from "monaco-editor";
// import {buildWorkerDefinition} from 'monaco-editor-workers';

// type EditorProps = {
//   fileContent: string | "Write your code here";
//   language: string;
//   onChange : (value : string) => void;
// }

// const CodeEditor: React.FC<EditorProps> = ({ fileContent, language, onChange })  => {
//   const editorRef = useRef<HTMLDivElement | null>(null);
//   const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

//   useEffect(() => {
//     const basePath = "https://cdn.jsdelivr.net/npm/monaco-editor/min/vs";
//     const workerPath = `${basePath}/base/worker`;
//     buildWorkerDefinition(workerPath, basePath, true);
//   },[])

//   useEffect(() => {
//     if(editorRef.current) {
//       monacoRef.current = monaco.editor.create(editorRef.current, {
//         value: fileContent,
//         language,
//         theme: "vs-dark",
//         automaticLayout: true,
//       });

//       monacoRef.current.onDidChangeModelContent(() => {
//         const updatedValue = monacoRef.current?.getValue() || "";
//         onChange(updatedValue);
//       });

//       return () => {
//         monacoRef.current?.dispose();
//       }
//     }
//   },[fileContent,language])

//   return <div ref={editorRef} style ={{position:"absolute",inset:0}}/>
// }

// export default CodeEditor;

import Editor from "@monaco-editor/react";

type CodeEditorProps = {
  fileContent: string;
  language: string;
  onChange: (value: string | undefined) => void;
};

export function CodeEditor({ fileContent, language, onChange }: CodeEditorProps) {
  return (
    <Editor
      height="90vh"
      language={language}
      value={fileContent}
      theme="vs-dark"
      onChange={onChange} // Callback to handle changes in the editor
      options={{
        automaticLayout: true, // Enable automatic resizing
        minimap: { enabled: false }, // Optional: Hide the minimap
      }}
    />
  );
}
