import * as React from 'react'
import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, LogOut } from 'lucide-react'

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
import { useToast } from '@/hooks/use-toast'
import { TripleButton } from './tripleButton'
import { useAuth } from "@/context/AuthContext"

type TaskType = 'Documentation' | 'Bug' | 'Feature' | 'Code'
type TaskStatus = 'In Progress' | 'Backlog' | 'Todo' | 'Canceled' | 'Done'
type TaskPriority = 'Low' | 'Medium' | 'High'

interface Task {
    id: string
    type: TaskType
    title: string
    status: TaskStatus
    priority: TaskPriority
}

export default function ProfilePage() {
    const [selectedTasks, setSelectedTasks] = React.useState<string[]>([])
    const [tasks, setTasks] = React.useState<Task[]>([])
    const [currentTaskWindow, setCurrentTaskWindow] = React.useState<Task[]>([])
    const [currentPage, setCurrentPage] = React.useState(1)
    const [rowsPerPage, setRowsPerPage] = React.useState("10")
    const { toast } = useToast()
    const navigate = useNavigate()
    const user = Cookies.get('user')
    const { setUser } = useAuth()

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
            toast({
                title: 'Error',
                description: 'Failed to fetch projects',
                variant: 'destructive'
            })
        }
    }, [user, toast])

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const handleNewProject = () => {
        toast({
            title: 'Please wait',
            description: 'Taking you to the new project page'
        })
        navigate('/')
    }

    const handleLogout = () => {
        Cookies.remove('token')
        Cookies.remove('user')
        setUser(null)
        navigate('/signin')
        toast({
            title: 'Logged out',
            description: 'You have been successfully logged out'
        })
    }

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case 'In Progress': return 'bg-blue-500'
            case 'Backlog': return 'bg-yellow-500'
            case 'Todo': return 'bg-gray-500'
            case 'Canceled': return 'bg-red-500'
            case 'Done': return 'bg-green-500'
            default: return 'bg-gray-500'
        }
    }

    useEffect(() => {
        const startIndex = (currentPage - 1) * parseInt(rowsPerPage)
        const endIndex = startIndex + parseInt(rowsPerPage)
        setCurrentTaskWindow(tasks.slice(startIndex, endIndex))
    },[tasks,currentPage,rowsPerPage])

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(tasks.length / parseInt(rowsPerPage))))
    }

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1))
    }

    return (
        <div className="min-h-screen p-6 space-y-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Welcome back, {user}!</h1>
                    <p className="text-gray-400">Here's a list of your projects</p>
                </div>
                <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Filter projects..."
                        className="max-w-xs bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    />
                    <Button onClick={handleNewProject} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Project
                    </Button>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-gray-700">
                            <TableHead className="w-12 text-gray-400">
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
                            <TableHead className="text-gray-400">Project</TableHead>
                            <TableHead className="text-gray-400">Status</TableHead>
                            <TableHead className="text-gray-400">Priority</TableHead>
                            <TableHead className="w-12 text-gray-400"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentTaskWindow.map((task) => (
                            <TableRow key={task.id} className="border-b border-gray-700">
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
                                            <Badge variant="secondary" className="bg-gray-700 text-gray-300">{task.type}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-400">{task.title}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                        {task.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-gray-300">
                                        {task.priority === 'High' && '↑'}
                                        {task.priority === 'Low' && '↓'}
                                        {task.priority}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <TripleButton name={task.title} username={user} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between text-gray-400">
                <div className="text-sm">
                    {selectedTasks.length} of {currentTaskWindow.length} row(s) selected
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Rows per page</span>
                        <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
                            <SelectTrigger className="w-16 bg-gray-800 border-gray-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        Page {currentPage} of {Math.ceil(tasks.length / parseInt(rowsPerPage))}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" disabled className="text-gray-500 hover:text-white">
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" onClick={handlePreviousPage} disabled={currentPage === 1} size="icon" className="text-gray-500 hover:text-white">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" onClick={handleNextPage} disabled={currentPage === Math.ceil(tasks.length / parseInt(rowsPerPage))} size="icon" className="text-gray-400 hover:text-white">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

