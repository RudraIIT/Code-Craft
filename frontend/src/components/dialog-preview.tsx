import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Circle } from 'lucide-react'
import Iframe from "react-iframe"

interface DialogPreviewProps {
  url: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DialogPreview({ url, open, onOpenChange }: DialogPreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 gap-0">
        <div className="w-full bg-[#2D2D2D] overflow-hidden rounded-lg">
          {/* Browser Chrome */}
          <div className="h-10 bg-[#38383A] flex items-center px-4 gap-2">
            {/* Traffic lights */}
            <div className="flex gap-2">
              <Circle className="h-3 w-3 fill-[#FF5F57] text-[#FF5F57]" />
              <Circle className="h-3 w-3 fill-[#FEBC2E] text-[#FEBC2E]" />
              <Circle className="h-3 w-3 fill-[#28C840] text-[#28C840]" />
            </div>
            {/* URL bar */}
            <div className="ml-4 flex-1">
              <div className="bg-[#2D2D2D] rounded-md px-3 py-1 text-sm text-gray-400 w-full max-w-md">
                {url}
              </div>
            </div>
          </div>
          {/* Browser Content */}
          <div className="h-[70vh]">
            <Iframe
              url={url}
              width="100%"
              height="100%"
              className="h-full w-full"
              display="initial"
              position="relative"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

