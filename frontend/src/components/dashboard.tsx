import { useState } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Code, CodepenIcon as ReactIcon, Server } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useSocketContext } from "../context/SocketContext"
import { useToast } from "@/hooks/use-toast"
import { useProject } from "@/context/ProjectContext"
import TransitionPage from "@/components/transition-page"
import { useNavigate } from "react-router-dom"

export function Dashboard() {
    const { socket } = useSocketContext();
    const [clicked, setClicked] = useState(false)
    const [projectName, setProjectName] = useState("")
    const [framework, setFramework] = useState("")
    const { toast } = useToast();
    const { setProject } = useProject();
    const [loading, setLoading] = useState(false)
    const user = Cookies.get('user');
    const navigate = useNavigate();

    const frameworkToMessageMap = {
        "react.js": "Please write npm install and npm run dev to start the project",
        "node": "Please write npm install and npm run dev to start the project",
        "cpp": "Please write g++ main.cpp -o main and ./main to start the project",
    } as const;
    
    const message =
        framework in frameworkToMessageMap
            ? frameworkToMessageMap[framework as keyof typeof frameworkToMessageMap]
            : "Invalid framework selected. Please check your configuration.";
    
    const launchReactProject = async () => {
        try {
            toast({
                title: "Launching project",
                description: "Please wait"
            })

            const response = await axios.post('http://localhost:3001/api/projects/launchReactProject', {
                user: user,
            }, {
                withCredentials: true
            })

            if (response.status === 200) {
                toast({
                    title: "Success",
                    description: "React Project launched successfully"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Error launching project",
                variant: "destructive"
            })
        }
    }

    const launchCppProject = async () => {
        try {
            toast({
                title: "Launching project",
                description: "Please wait"
            })

            const response = await axios.post('http://localhost:3001/api/projects/launchCppProject', {
                user: user,
            }, {
                withCredentials: true
            })

            if (response.status === 200) {
                toast({
                    title: "Success",
                    description: "C++ Project launched successfully"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Error launching project",
                variant: "destructive"
            })
        }
    }

    const handleSubmit = async () => {
        if (!projectName) {
            toast({
                title: "Project name is required",
                description: "Please enter a project name",
                variant: "destructive"
            })
            return;
        }

        if (!framework) {
            toast({
                title: "Framework is required",
                description: "Please select a framework",
                variant: "destructive"
            })
            return;
        }
        
        setLoading(true)
        setProject(projectName)

        Cookies.set('project', projectName)
        Cookies.set('framework', framework)

        if (socket) {
            if (framework === "react.js") {
                await launchReactProject()
            } else if (framework === "cpp") {
                await launchCppProject()
            }

            setClicked(!clicked)
            if (!clicked) {
                socket.emit('newcontainer', { framework })
            } else {
                socket.off('newcontainer')
            }
        }
    }

    return ( 
        <>
            {loading ? (
                <TransitionPage message={message} duration={3000} onComplete={() => window.location.href = 'http://localhost:5173/project'}/>
            ) : (
                <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:p-10">
                    <Card className="w-[500px] bg-gray-800 border-gray-700 text-white">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Create Project</CardTitle>
                            <CardDescription className="text-gray-400">Use the online IDE for development.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form>
                                <div className="grid w-full items-center gap-4">
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="name" className="text-gray-300">Name</Label>
                                        <Input 
                                            id="name" 
                                            placeholder="Name of your project"  
                                            value={projectName} 
                                            onChange={(e) => setProjectName(e.target.value)}
                                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        />
                                    </div>
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="framework" className="text-gray-300">Framework</Label>
                                        <Select onValueChange={(value) => setFramework(value)} value={framework}>
                                            <SelectTrigger id="framework" className="bg-gray-700 border-gray-600 text-white">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-700 border-gray-600 text-white">
                                                <SelectItem value="cpp">
                                                    <div className="flex items-center">
                                                        <Code className="mr-2 h-4 w-4" />
                                                        C++
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="node">
                                                    <div className="flex items-center">
                                                        <Server className="mr-2 h-4 w-4" />
                                                        Node.js
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="react.js">
                                                    <div className="flex items-center">
                                                        <ReactIcon className="mr-2 h-4 w-4" />
                                                        React.js
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button onClick={() => navigate(-1)} variant="outline" className="bg-gray-700 text-white hover:bg-gray-600">Cancel</Button>
                            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">Launch</Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </>
    )
}

