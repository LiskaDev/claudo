import { useState, useEffect } from 'react';

export interface Group {
  id: string;
  name: string;
  conversationIds: string[];
  collapsed: boolean;
}

const STORAGE_KEY = 'claudo_groups';

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      if (result[STORAGE_KEY]) {
        setGroups(result[STORAGE_KEY]);
      }
    });
  }, []);

  const save = (newGroups: Group[]) => {
    setGroups(newGroups);
    void chrome.storage.local.set({ [STORAGE_KEY]: newGroups });
  };

  const createGroup = (name: string) => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name,
      conversationIds: [],
      collapsed: false,
    };
    save([...groups, newGroup]);
  };

  const addToGroup = (groupId: string, convId: string) => {
    save(groups.map(g =>
      g.id === groupId
        ? { ...g, conversationIds: [...new Set([...g.conversationIds, convId])] }
        : g
    ));
  };

  const removeFromGroup = (groupId: string, convId: string) => {
    save(groups.map(g =>
      g.id === groupId
        ? { ...g, conversationIds: g.conversationIds.filter(id => id !== convId) }
        : g
    ));
  };

  const toggleCollapse = (groupId: string) => {
    save(groups.map(g =>
      g.id === groupId ? { ...g, collapsed: !g.collapsed } : g
    ));
  };

  const deleteGroup = (groupId: string) => {
    save(groups.filter(g => g.id !== groupId));
  };

  const renameGroup = (groupId: string, name: string) => {
    save(groups.map(g => g.id === groupId ? { ...g, name } : g));
  };

  return { groups, createGroup, addToGroup, removeFromGroup, toggleCollapse, deleteGroup, renameGroup };
}
