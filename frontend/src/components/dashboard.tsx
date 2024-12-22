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

export function Dashboard() {
    const { socket } = useSocketContext();
    const [clicked, setClicked] = useState(false)
    const [projectName, setProjectName] = useState("")
    const [framework, setFramework] = useState("")
    const navigate = useNavigate()
    const { toast } = useToast();
    const { setProject } = useProject();

    const handleSubmit = () => {
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
            setClicked(!clicked)
            if (!clicked) {
                socket.emit('newcontainer')
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

