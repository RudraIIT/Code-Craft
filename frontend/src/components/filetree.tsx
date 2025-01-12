import { ChevronRightIcon } from '@heroicons/react/16/solid';
import { DocumentIcon, FolderIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { useSocketContext } from '@/context/SocketContext';
import { ContextMenu, ContextMenuItem, ContextMenuTrigger, ContextMenuContent } from '@/components/ui/context-menu'; // Adjust import path as necessary

type Node = {
  name: string;
  nodes?: Node[];
};

export function FileTree({
  node,
  onFileClick,
  onRename,
}: {
  node: Node;
  onFileClick: (node: Node) => void;
  onRename: (node: Node, newName: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);
  const { socket } = useSocketContext();

  const handleClick = () => {
    if (!node.nodes) {
      onFileClick(node);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleRename = () => {
    setIsRenaming(true);
  };

  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== node.name) {
      onRename(node, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setNewName(node.name);
  };

  useEffect(() => {
    if (socket) {
      socket.emit('files:rw');
    }
  }, [socket]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <li key={node.name}>
          <span
            className="flex items-center gap-1.5 py-1 cursor-pointer"
            onClick={handleClick}
          >
            {node.nodes && node.nodes.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                }}
                className="p-1 -m-1"
              >
                <ChevronRightIcon
                  className={`size-4 text-gray-500 ${isOpen ? 'rotate-90' : ''}`}
                />
              </button>
            )}

            {node.nodes ? (
              <FolderIcon
                className={`size-6 text-sky-500 ${node.nodes.length === 0 ? 'ml-[22px]' : ''}`}
              />
            ) : (
              <DocumentIcon className="ml-[22px] size-6 text-gray-900" />
            )}

            {isRenaming ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit();
                  if (e.key === 'Escape') handleRenameCancel();
                }}
                className="border border-gray-300 rounded px-1 py-0.5 w-40 focus:outline-none focus:ring focus:ring-sky-500"
                autoFocus
              />
            ) : (
              <span className="truncate">{node.name}</span>
            )}
          </span>

          {isOpen && node.nodes && (
            <ul className="pl-6">
              {node.nodes.map((childNode) => (
                <FileTree
                  key={childNode.name}
                  node={childNode}
                  onFileClick={onFileClick}
                  onRename={onRename}
                />
              ))}
            </ul>
          )}
        </li>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleRename}>Rename</ContextMenuItem>
        <ContextMenuItem onClick={() => alert(`Deleting ${node.name}`)}>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
