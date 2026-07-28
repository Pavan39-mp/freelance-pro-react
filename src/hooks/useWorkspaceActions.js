import { useProjects } from '../context/ProjectContext';
import { useTasks } from '../context/TaskContext';
import toast from 'react-hot-toast';

export const useWorkspaceActions = () => {
  const { deleteProject } = useProjects();
  const { deleteTasksByProject } = useTasks();

  const deleteProjectCascade = (projectId, projectName) => {
    if (window.confirm(`Are you sure you want to delete project "${projectName}"? This will also delete all associated tasks.`)) {
      deleteProject(projectId);
      deleteTasksByProject(projectId);
      toast.success('Project and associated tasks deleted.');
    }
  };

  return {
    deleteProjectCascade
  };
};
