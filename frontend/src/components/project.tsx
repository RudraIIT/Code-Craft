import { useState, useEffect } from "react"
import { useSocketContext } from "@/context/SocketContext"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import Cookies from "js-cookie"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, Play, Save, LogOut } from 'lucide-react'
import { DialogPreview } from "@/components/dialog-preview"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CodeEditor } from "./editor"
import { XTerminal } from "./terminal"
import { FileTree } from "./filetree"

type Node = {
  name: string
  nodes?: Node[]
}

export default function Project() {
  const [nodes, setNodes] = useState<Node[]>([])
  const { socket } = useSocketContext()
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>("")
  const [language, setLanguage] = useState<string>("")
  const user = Cookies.get("user")
  const projectName = Cookies.get("project")
  const { toast } = useToast()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const framework = Cookies.get("framework")
  const [previewOpen, setPreviewOpen] = useState(false)


  const handleRename = (node: Node, newName: string) => {
    if (!socket) {
      console.error("WebSocket is not connected.");
      return;
    }

    if (!node || !newName) {
      console.error("Node or new name is missing.");
      return;
    }

    const oldPath = fullFilePath(selectedFile!, nodes);
    console.log('Old path:', oldPath);
    if (!oldPath) {
      console.error("Failed to generate the old file path.");
      return;
    }

    console.log("Renaming file:", oldPath, "to", newName);

    socket.emit("files:rename", { oldName: oldPath, newName });
  };


  const handleFileClick = async (node: Node) => {
    if (!node.nodes) {
      const fileExtension = node.name.split('.').pop();
      const languageMap: { [key: string]: string } = {
        "py": "python",
        "js": "javascript",
        "ts": "typescript",
        "c": "c",
        "cpp": "cpp",
        "java": "java",
        "html": "html",
        "css": "css",
        "json": "json",
        "xml": "xml",
        "md": "markdown",
      };

      setLanguage(languageMap[fileExtension!]);
      const content = await fetchFileContent(node.name);
      setSelectedFile(node.name);
      setFileContent(content || "");
    }
  }

  const fullFilePath = (fileName: string, nodes: Node[], currentPath = ""): string | undefined => {
    for (let node of nodes) {
      const newPath = currentPath ? `${currentPath}/${node.name}` : node.name;
      if (node.name === fileName) {
        return newPath;
      }
      if (node.nodes) {
        const res = fullFilePath(fileName, node.nodes, newPath);
        if (res) return res;
      }
    }
    return undefined;
  };

  const fetchFileContent = async (filename: string) => {
    if (socket) {
      const fileName = fullFilePath(filename, nodes);
      socket.emit("file:read", { fileName });
      return new Promise<string>((resolve) => {
        socket.on("file:content", (content: string) => {
          resolve(content);
        });
      });
    }
  }

  const handleRun = async () => {
    const fileName = fullFilePath(selectedFile!, nodes);
    if (socket) {
      console.log('Running file:', fileName);
      socket.emit('run', { filename: fileName });
    }
  }

  const handleSave = async () => {
    try {
      toast({
        title: "Saving file",
      })

      const response = await axios.post(`http://localhost:3001/api/projects/saveFile`, {
        user: user,
        project: projectName,
        framework: framework,
      }, {
        withCredentials: true,
      });

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Project saved successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save file",
        variant: "destructive"
      })
      console.log('Error saving file:', error);
    }
  }

  const handleExit = async () => {
    if (window.confirm("Are you sure you want to exit?")) {
      try {
        if (socket) {
          socket.close();
        }

        const response = await axios.post(`http://localhost:3001/api/projects/cleanUserDir`, {
          user: user,
        }, {
          withCredentials: true,
        });

        if (response.status === 200) {
          Cookies.remove('project');
          window.location.href = 'http://localhost:5173/profile';
        }
      } catch (error) {
        console.log('Error cleaning user directory:', error);
      }
    }
  }

  useEffect(() => {
    if (socket) {
      socket.emit('files:rw');

      socket.on('files:rw', (data: any) => {
        // console.log('Files:', data);
        setNodes(data);
      });

      socket.on('files:error', (message: string) => {
        console.error(message);
        alert(`Error: ${message}`);
      });

      setTimeout(() => {
        if (selectedFile) {
          socket.emit('files:write', { filename: fullFilePath(selectedFile, nodes), content: fileContent });
        }
      }, 2000);

      return () => {
        socket.off('files:rw');
        socket.off('files:error');
      };
    }
  }, [socket, fileContent, selectedFile]);


  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        {/* Cool Sidebar */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "20%" }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ResizablePanel
                defaultSize={20}
                minSize={15}
                maxSize={30}
                className="h-full border-r border-gray-700 bg-gray-800"
              >
                <div className="flex h-full w-full flex-col">
                  <div className="flex items-center justify-between p-4">
                    <h2 className="text-xl font-bold">Project Files</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSidebarCollapsed(true)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <ul className="space-y-2 p-4">
                      {nodes.map((node) => (
                        <FileTree
                          onRename={handleRename}
                          onFileClick={handleFileClick}
                          node={node}
                          key={node.name}
                        />
                      ))}
                    </ul>
                  </div>
                </div>
              </ResizablePanel>
            </motion.div>
          )}
        </AnimatePresence>

        {sidebarCollapsed && (
          <div className="flex h-full items-center">
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => setSidebarCollapsed(false)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* <ResizableHandle withHandle className="bg-gray-700 data-[hover]:bg-gray-600" /> */}

        {/* Code Editor and Terminal Panels */}
        <ResizablePanel className="h-full w-full relative">
          <ResizablePanelGroup direction="vertical" className="h-full w-full relative">
            {/* Code Editor Panel */}
            <ResizablePanel
              defaultSize={70}
              minSize={50}
              className="h-full border-b border-gray-700 relative"
            >
              <div className="absolute right-4 top-4 z-10 flex space-x-2">
                <Button size="sm" onClick={handleRun}>
                  <Play className="mr-2 h-4 w-4" />
                  Run
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button size="sm" variant="destructive" onClick={handleExit}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Exit
                </Button>
              </div>

              <Tabs defaultValue="editor" className="h-full w-full bg-gray-900">
                <TabsList className="h-10 flex items-center gap-4 bg-gray-800">
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="preview" onClick={() => setPreviewOpen(true)}>Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="editor" className="h-full w-full">
                  <CodeEditor
                    fileContent={fileContent}
                    language={language}
                    onChange={(updatedContent: any) => setFileContent(updatedContent)}
                  />
                </TabsContent>
              </Tabs>

              {/* Preview Dialog */}
              <DialogPreview 
                url="http://localhost:8080/"
                open={previewOpen}
                onOpenChange={setPreviewOpen}
              />
            </ResizablePanel>

            <ResizableHandle className="bg-gray-700 data-[hover]:bg-gray-600" />

            {/* Terminal Panel */}
            <ResizablePanel defaultSize={30} minSize={0} className="h-full relative overflow-hidden">
              <XTerminal />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

