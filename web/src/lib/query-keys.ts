 // Central registry for TanStack Query keys.
 // Hierarchical structure enables granular invalidation:
 //
 //   usersKeys.all            → all users data
 //   usersKeys.lists()        → all list queries
 //   usersKeys.list(filters)  → specific filtered lists
 //   usersKeys.detail(id)     → single user

export const usersKeys = {
  all: ['users'] as const,

  lists: () => [...usersKeys.all, 'list'] as const,

  list: (query: Readonly<Record<string, unknown>>) =>
    [...usersKeys.lists(), query] as const,

  details: () => [...usersKeys.all, 'detail'] as const,

  detail: (id: string) =>
    [...usersKeys.details(), id] as const,
};