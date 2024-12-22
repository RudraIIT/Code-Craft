import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectContextType {
    projectName: string;
    setProject: (name: string) => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const useProject = (): ProjectContextType => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};

interface ProjectProviderProps {
    children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
    const [projectName, setProjectName] = useState<string>('');

    const setProject = (name: string) => {
        setProjectName(name);
    };

    return (
        <ProjectContext.Provider value={{ projectName, setProject }}>
            {children}
        </ProjectContext.Provider>
    );
};
