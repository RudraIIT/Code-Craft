import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeEditor } from "./editor"
import { XTerminal } from "./terminal"
import { FileTree } from "./filetree"
import { useEffect, useState } from "react"
import { useSocketContext } from "@/context/SocketContext"
import { EditorActions } from "./editor-actions"
import axios from "axios"
import Cookies from "js-cookie"
import { useToast } from "@/hooks/use-toast"
import { useProject } from "@/context/ProjectContext"
import Iframe from 'react-iframe'
import { useNavigate } from "react-router-dom"


type Node = {
    name: string
    nodes?: Node[]
}

export default function Project() {
    const [nodes, setNodes] = useState<Node[]>([]);
    const { socket } = useSocketContext();
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string>("");
    const [language, setLanguage] = useState<string>("");
    const user = Cookies.get('user');
    const { projectName } = useProject();
    const { toast } = useToast();
    const [preview, setPreview] = useState(false);
    const navigate = useNavigate();

    console.log('Project name:', projectName);

    const handlePreview = () => {
        setPreview(!preview);
    }

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

    const handleRun = () => {

    }

    const handleSave = async () => {
        try {
            toast({
                title: "Saving file",
            })

            const response = await axios.post(`http://localhost:3001/api/projects/saveFile`, {
                user: user,
                project: projectName,
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
                if(socket) {
                    socket.close();
                }

                const response = await axios.post(`http://localhost:3001/api/projects/cleanUserDir`, {
                    user: user,
                }, {
                    withCredentials: true,
                });
    
                if(response.status === 200) {
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
        <div className="h-screen w-full overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="h-full w-full">
                {/* File Tree Panel */}
                <ResizablePanel
                    defaultSize={20}
                    minSize={15}
                    maxSize={30}
                    className="h-full border-r bg-muted/50"
                >
                    <div className="h-full w-full">
                        <ul>
                            {nodes.map((node) => (
                                <FileTree onFileClick={handleFileClick} node={node} key={node.name} />
                            ))}
                        </ul>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle className="bg-muted data-[hover]:bg-muted/70" />
                {/* Code Editor and Terminal Panels */}
                <ResizablePanel className="h-full w-full relative">
                    <ResizablePanelGroup direction="vertical" className="h-full w-full relative">
                        {/* Code Editor Panel */}
                        <ResizablePanel
                            defaultSize={70}
                            minSize={50}
                            className="h-full border-b relative"
                        >
                            <EditorActions onRun={handleRun} onPreview={handlePreview} onSave={handleSave} onExit={handleExit} />
                            {/* {preview ? (
                                <Iframe
                                    url="http://localhost:8080/"
                                    width="100%"
                                    height="100%"
                                    id="myId"
                                    className="h-full w-full"
                                    display="initial"
                                    position="relative"
                                />
                            ) : (
                                <CodeEditor
                                    fileContent={fileContent}
                                    language={language}
                                    onChange={(updatedContent: any) => setFileContent(updatedContent)}
                                />
                            )} */}

                            <Tabs defaultValue="editor" className="h-full w-full bg-black">
                                <TabsList className="h-10 flex items-center gap-4 bg-black">
                                    <TabsTrigger value="editor">Editor</TabsTrigger>
                                    <TabsTrigger value="preview">Preview</TabsTrigger>
                                </TabsList>
                                <TabsContent value="editor" className="h-full w-full">
                                    <CodeEditor
                                        fileContent={fileContent}
                                        language={language}
                                        onChange={(updatedContent: any) => setFileContent(updatedContent)}
                                    />
                                </TabsContent>
                                <TabsContent value="preview" className="h-full w-full">
                                    <Iframe
                                        url="http://localhost:8080/"
                                        width="100%"
                                        height="100%"
                                        id="myId"
                                        className="h-full w-full"
                                        display="initial"
                                        position="relative"
                                    />
                                </TabsContent>
                            </Tabs>       

                        </ResizablePanel>
                        <ResizableHandle withHandle className="bg-muted data-[hover]:bg-muted/70" />
                        {/* Terminal Panel */}
                        <ResizablePanel defaultSize={30} minSize={20} className="h-full relative overflow-y-scroll">
                            <XTerminal />
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
