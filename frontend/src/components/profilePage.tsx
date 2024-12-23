import * as React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { TripleButton } from './tripleButton'
import axios from 'axios'
import Cookies from 'js-cookie'

type TaskType = 'Documentation' | 'Bug' | 'Feature'
type TaskStatus = 'In Progress' | 'Backlog' | 'Todo' | 'Canceled' | 'Done'
type TaskPriority = 'Low' | 'Medium' | 'High'

interface Task {
    id: any
    type: TaskType | 'Code'
    title: string
    status: TaskStatus | 'In Progress'
    priority: TaskPriority | 'Medium'
}

export default function ProfilePage() {
    const [selectedTasks, setSelectedTasks] = React.useState<string[]>([])
    const [rowsPerPage, setRowsPerPage] = React.useState("10")
    const [tasks, setTasks] = React.useState<Task[]>([])
    const { toast } = useToast()
    const navigate = useNavigate();
    const user = Cookies.get('user')

    const fetchTasks = useCallback(async () => {
        try {
            toast({
                title: 'Fetching projects'
            })
            const response = await axios.get(`http://localhost:3001/api/projects/userProjects/${user}`, {
                withCredentials: true,
            })
            setTasks(response.data)
            toast({
                title: 'Success',
                description: 'Projects fetched successfully'
            })
        } catch (error) {
            console.log(error)
        }
    },[user])

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const handleNewProject = () => {
        toast({
            title: 'Please wait taking you to the new project page'
        })
        navigate('/');
    }

    const getStatusColor = (status: Task['status']) => {
        switch (status) {
            case 'In Progress': return 'text-blue-500'
            case 'Backlog': return 'text-yellow-500'
            case 'Todo': return 'text-gray-500'
            case 'Canceled': return 'text-red-500'
            case 'Done': return 'text-green-500'
            default: return ''
        }
    }

    return (
        <div className="p-6 space-y-6 bg-background text-foreground">
            <div>
                <h1 className="text-2xl font-bold">Welcome back!</h1>
                <p className="text-muted-foreground">Here's a list of your tasks for this month!</p>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Filter tasks..."
                        className="max-w-xs"
                    />
                    <Button onClick={handleNewProject} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Create Project
                    </Button>
                </div>
                {/* <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-muted-foreground">
                        Status
                    </Button>
                    <Button variant="ghost" className="text-muted-foreground">
                        Priority
                    </Button>
                </div> */}
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <Checkbox
                                checked={selectedTasks.length === tasks.length}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setSelectedTasks(tasks.map(task => task.id))
                                    } else {
                                        setSelectedTasks([])
                                    }
                                }}
                            />
                        </TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="w-12"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((task) => (
                        <TableRow key={task.id}>
                            <TableCell>
                                <Checkbox
                                    checked={selectedTasks.includes(task.id)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedTasks([...selectedTasks, task.id])
                                        } else {
                                            setSelectedTasks(selectedTasks.filter(id => id !== task.id))
                                        }
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{task.id}</span>
                                        <Badge variant="secondary">{task.type}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{task.title}</p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className={getStatusColor(task.status)}>{task.status}</span>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1">
                                    {task.priority === 'High' && '↑'}
                                    {task.priority === 'Low' && '↓'}
                                    {task.priority}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>
                                    <TripleButton name={task.title} username={user} />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {selectedTasks.length} of {tasks.length} row(s) selected
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Rows per page</span>
                        <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
                            <SelectTrigger className="w-16">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        Page 1 of 10
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" disabled>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" disabled>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

