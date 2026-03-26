import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConversations } from './useConversations';
import { useGroups } from './useGroups';

export function ConversationGroups() {
  const { t } = useTranslation();
  const conversations = useConversations(t('conversationGroups.unnamedChat'));
  const { groups, createGroup, addToGroup, removeFromGroup, toggleCollapse, deleteGroup } = useGroups();
  const [view, setView] = useState<'groups' | 'native'>('groups');
  const [newGroupName, setNewGroupName] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Ungrouped calculations
  const groupedIds = new Set(groups.flatMap(g => g.conversationIds));
  const ungrouped = conversations.filter(c => !groupedIds.has(c.id));

  if (view === 'native') return null;

  return (
    <div className="fixed top-0 left-0 w-[260px] h-screen bg-[#ece5dd] dark:bg-[#18181b] border-r border-[#e5e0d8] dark:border-[#27272a] z-[9998] flex flex-col font-sans shadow-lg dark:shadow-none pointer-events-auto">
      {/* Top tabs */}
      <div className="flex border-b border-[#e5e0d8] dark:border-[#27272a] shrink-0">
        {(['groups', 'native'] as const).map(v => {
          const isActive = view === v;
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 py-3 text-[12px] cursor-pointer transition-colors outline-none focus:outline-none ${
                isActive 
                  ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-100 border-b-2 border-b-[#D97757]' 
                  : 'bg-transparent text-zinc-500 dark:text-zinc-400 border-b-2 border-b-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
              }`}
            >
              {v === 'groups' ? t('conversationGroups.tabGroups') : t('conversationGroups.tabNative')}
            </button>
          );
        })}
      </div>

      {/* New Group */}
      <div className="p-2 border-b border-[#e5e0d8] dark:border-[#27272a] shrink-0 flex gap-1.5 items-center">
        <input
          value={newGroupName}
          onChange={e => setNewGroupName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && newGroupName.trim()) {
              createGroup(newGroupName.trim());
              setNewGroupName('');
            }
          }}
          placeholder={t('conversationGroups.newGroupPlaceholder')}
          className="flex-1 px-2.5 py-1.5 text-[12px] rounded-md border border-[#e5e0d8] dark:border-[#27272a] bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 outline-none focus:border-[#D97757]/50 transition-colors"
        />
        <button
          onClick={() => {
            if (newGroupName.trim()) {
              createGroup(newGroupName.trim());
              setNewGroupName('');
            }
          }}
          className="px-3 py-1.5 rounded-md bg-[#D97757] hover:bg-[#c4694b] text-white cursor-pointer text-[14px] font-medium leading-none transition-colors outline-none focus:outline-none"
        >
          +
        </button>
      </div>

      {/* Group List */}
      <div className="flex-1 overflow-y-auto py-2">
        {groups.map(group => (
          <div
            key={group.id}
            onDragOver={e => e.preventDefault()}
            onDrop={() => {
              if (draggingId) {
                addToGroup(group.id, draggingId);
                setDraggingId(null);
              }
            }}
            className="mb-1"
          >
            {/* Header */}
            <div
              className="flex items-center px-3 py-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group"
              onClick={() => toggleCollapse(group.id)}
            >
              <span className="text-[10px] text-zinc-400 mr-2 w-3 flex justify-center shrink-0">
                {group.collapsed ? '▶' : '▼'}
              </span>
              <span className="flex-1 text-[12.5px] font-medium text-zinc-800 dark:text-zinc-200 truncate select-none">
                {group.name}
              </span>
              <span className="text-[11px] text-zinc-500 mx-1 shrink-0">
                {group.conversationIds.length}
              </span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  deleteGroup(group.id);
                }}
                className="ml-1 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer outline-none focus:outline-none"
                aria-label="Delete group"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            {!group.collapsed && group.conversationIds.map(convId => {
              const conv = conversations.find(c => c.id === convId);
              if (!conv) return null;
              return (
                <div
                  key={convId}
                  draggable
                  onDragStart={() => setDraggingId(convId)}
                  onClick={() => window.location.href = conv.url}
                  className="px-3 pl-[30px] py-1.5 text-[12px] cursor-pointer text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group/item"
                >
                  <span className="flex-1 truncate select-none">
                    {conv.title}
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      removeFromGroup(group.id, convId);
                    }}
                    className="text-zinc-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity p-0.5 cursor-pointer shrink-0 outline-none focus:outline-none"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        ))}

        {/* Ungrouped */}
        {ungrouped.length > 0 && (
          <div className="mt-4 mb-2">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-500 tracking-wide select-none">
              {t('conversationGroups.ungrouped')} ({ungrouped.length})
            </div>
            {ungrouped.map(conv => (
              <div
                key={conv.id}
                draggable
                onDragStart={() => setDraggingId(conv.id)}
                onClick={() => window.location.href = conv.url}
                className="px-3 py-1.5 pl-[30px] text-[12px] cursor-pointer text-zinc-600 dark:text-zinc-400 flex items-center hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <span className="flex-1 truncate select-none">
                  {conv.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
