'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  role: string;
}

interface WorkspaceStore {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  switchWorkspace: (workspaceId: string) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      currentWorkspace: null,
      workspaces: [],
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      setWorkspaces: (workspaces) => {
        set({ workspaces });
        if (!get().currentWorkspace && workspaces.length > 0) {
          set({ currentWorkspace: workspaces[0] });
        }
      },
      switchWorkspace: (workspaceId) => {
        const workspace = get().workspaces.find((w) => w.id === workspaceId);
        if (workspace) {
          set({ currentWorkspace: workspace });
        }
      },
    }),
    {
      name: 'bravilio-workspace',
    }
  )
);
