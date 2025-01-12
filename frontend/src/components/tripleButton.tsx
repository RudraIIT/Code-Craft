import { useState } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Edit2, Loader2 } from 'lucide-react'

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
import { useToast } from "@/hooks/use-toast"
import { useSocketContext } from "@/context/SocketContext"

interface TripleButtonProps {
    name: string
    username: string | undefined
}

export function TripleButton({ name, username }: TripleButtonProps) {
    const { socket } = useSocketContext()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setIsLoading(true)

        try {
            toast({
                title: 'Launching project',
                description: 'Please wait...'
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
                    socket.emit('newcontainer', { framework: "" })
                    window.location.href = `http://localhost:5173/project`
                }
            }
        } catch (error) {
            console.error(error)
            toast({
                title: 'Error',
                description: 'Failed to launch project',
                variant: 'destructive'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Open
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-gray-800 border-gray-700 text-white">
                <SheetHeader>
                    <SheetTitle className="text-white">Edit Project Details</SheetTitle>
                    <SheetDescription className="text-gray-400">
                        Make changes to your project here. Click launch when you're done.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right text-gray-300">
                            Name
                        </Label>
                        <Input 
                            id="name" 
                            defaultValue={name} 
                            className="col-span-3 bg-gray-700 border-gray-600 text-white" 
                            readOnly 
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right text-gray-300">
                            Username
                        </Label>
                        <Input 
                            id="username" 
                            defaultValue={username} 
                            className="col-span-3 bg-gray-700 border-gray-600 text-white" 
                            readOnly 
                        />
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button 
                            onClick={handleSubmit} 
                            type="submit" 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Launching...
                                </>
                            ) : (
                                'Launch'
                            )}
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

