import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { toast } from "@/hooks/use-toast"
import { useSocketContext } from "@/context/SocketContext"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Cookies from "js-cookie"

interface TripleButtonProps {
    name: string
    username: string | undefined
}

export function TripleButton({name, username}: TripleButtonProps) {
    const {socket} = useSocketContext();
    const navigate = useNavigate();
    
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        const fetchProject = async () => {
            try {
                toast({
                    title: 'Launching project'
                })

                const response = await axios.post(`http://localhost:3001/api/projects/launchProject`, {
                    user: username,
                    project: name
                }, {
                    withCredentials: true,
                })

                if (response.status === 200) {
                    Cookies.set('project', name)
                    toast({
                        title: 'Success',
                        description: 'Project launched successfully'
                    })

                    if (socket) {
                        socket.emit('newcontainer',{framework:""})
                        navigate('/project')
                    }
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Error fetching projects'
                })
            }
        }

        fetchProject()
    }
    return (
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline">Open</Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Edit Project Details</SheetTitle>
                        <SheetDescription>
                            Make changes to your project here. Click save when you're done.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input id="name" defaultValue="" value={name} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right">
                                Username
                            </Label>
                            <Input id="username" defaultValue="" value={username} className="col-span-3" />
                        </div>
                    </div>
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button onClick={handleSubmit} type="submit">Launch</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
    )
}
