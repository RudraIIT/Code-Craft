import { ChevronRightIcon } from '@heroicons/react/16/solid';
import { DocumentIcon, FolderIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

type Node = {
  name: string;
  nodes?: Node[];
};

export function FileTree({ node, onFileClick }: { node: Node; onFileClick: (node: Node) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (!node.nodes) {
      onFileClick(node); // Trigger the callback if it's a file
    } else {
      setIsOpen(!isOpen); // Toggle folder open/close
    }
  };

  return (
    <li key={node.name}>
      <span
        className="flex items-center gap-1.5 py-1 cursor-pointer"
        onClick={handleClick}
      >
        {node.nodes && node.nodes.length > 0 && (
          <button onClick={(e) => { 
            e.stopPropagation(); 
            setIsOpen(!isOpen); 
          }} className="p-1 -m-1">
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
        {node.name}
      </span>

      {isOpen && node.nodes && (
        <ul className="pl-6">
          {node.nodes.map((childNode) => (
            <FileTree key={childNode.name} node={childNode} onFileClick={onFileClick} />
          ))}
        </ul>
      )}
    </li>
  );
}
