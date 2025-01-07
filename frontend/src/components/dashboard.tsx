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
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSocketContext } from "../context/SocketContext"
import { useToast } from "@/hooks/use-toast"
import { useProject } from "@/context/ProjectContext"
import axios from "axios"
import Cookies from "js-cookie"

export function Dashboard() {
    const { socket } = useSocketContext();
    const [clicked, setClicked] = useState(false)
    const [projectName, setProjectName] = useState("")
    const [framework, setFramework] = useState("")
    const navigate = useNavigate()
    const { toast } = useToast();
    const { setProject } = useProject();
    const user = Cookies.get('user');

    const launchReactProject = async ()=> {
        try {
            toast({
                title: "Launching project",
                description: "Please wait"
            })

            const response = await axios.post('http://localhost:3001/api/projects/launchReactProject',{
                user: user,
            }, {
                withCredentials: true
            })

            if(response.status === 200){
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

            const response = await axios.post('http://localhost:3001/api/projects/launchCppProject',{
                user: user,
            }, {
                withCredentials: true
            })

            if(response.status === 200){
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

        setProject(projectName)

        if (socket) {
            if(framework === "react.js") {
                await launchReactProject()
            } else if(framework === "cpp") {
                await launchCppProject()
            }

            setClicked(!clicked)
            if (!clicked) {
                socket.emit('newcontainer',{framework})
                navigate('/project')
            } else {
                socket.off('newcontainer')
            }
        }
    }

    return (

        <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
            <Card className="w-[500px]">
                <CardHeader>
                    <CardTitle>Create project</CardTitle>
                    <CardDescription>Use the online IDE for development.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Name of your project"  value={projectName} onChange={(e) => setProjectName(e.target.value)}/>
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="framework">Framework</Label>
                                <Select onValueChange={(value) => setFramework(value)} value={framework}>
                                    <SelectTrigger id="framework">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectItem value="cpp">C++</SelectItem>
                                        <SelectItem value="node">Node.js</SelectItem>
                                        <SelectItem value="react.js">React.js</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={handleSubmit}>Launch</Button>
                </CardFooter>
            </Card>
        </div>
    )
}

