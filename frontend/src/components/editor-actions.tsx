import { Play, Save, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface EditorActionsProps {
  onRun?: () => void
  onSave?: () => void
  onExit?: () => void
}

export function EditorActions({ onRun, onSave, onExit }: EditorActionsProps) {
  return (
    <div className="absolute right-4 top-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
            <span className="sr-only">Actions menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onRun}>
            <Play className="mr-2 h-4 w-4" />
            Run
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExit}>
            <X className="mr-2 h-4 w-4" />
            Exit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

