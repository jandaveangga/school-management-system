import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import type { ApiError } from '@/lib/api-error';
import { usersKeys } from '@/lib/query-keys';
import type { PaginatedResponse } from '@/types/api';

import type { PublicUser, RoleName } from '@/features/auth/schemas';
import { usersService } from './services';

import type {
  ListUsersQuery,
  StudentProfile,
  TeacherProfile,
} from './schemas';

//
// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────
//

export const useUsersList = (
  query: ListUsersQuery,
): UseQueryResult<
  PaginatedResponse<PublicUser>,
  ApiError
> => {
  return useQuery({
    queryKey: usersKeys.list(query),
    queryFn: () => usersService.list(query),
    placeholderData: (prev) => prev,
  });
};

export const useUser = (
  id: string | undefined,
): UseQueryResult<PublicUser, ApiError> => {
  return useQuery({
    queryKey:
      id !== undefined
        ? usersKeys.detail(id)
        : ['users', 'detail', 'noop'],
    queryFn: () => usersService.get(id ?? ''),
    enabled: id !== undefined && id.length > 0,
  });
};

//
// ─────────────────────────────────────────────────────────────
// Mutations - Users
// ─────────────────────────────────────────────────────────────
//

interface CreateUserVars {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive?: boolean;
  roles: readonly RoleName[];
}

export const useCreateUser = (): UseMutationResult<
  PublicUser,
  ApiError,
  CreateUserVars
> => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: usersService.create,
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: usersKeys.lists(),
      });
    },
  });
};

interface UpdateUserVars {
  id: string;
  patch: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    isActive?: boolean;
  };
}

export const useUpdateUser = (): UseMutationResult<
  PublicUser,
  ApiError,
  UpdateUserVars
> => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }) =>
      usersService.update(id, patch),

    onSuccess: (data) => {
      qc.setQueryData(
        usersKeys.detail(data.id),
        data,
      );

      void qc.invalidateQueries({
        queryKey: usersKeys.lists(),
      });
    },
  });
};

export const useDeleteUser = (): UseMutationResult<
  void,
  ApiError,
  string
> => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: usersService.remove,

    onSuccess: (_void, id) => {
      qc.removeQueries({
        queryKey: usersKeys.detail(id),
      });

      void qc.invalidateQueries({
        queryKey: usersKeys.lists(),
      });
    },
  });
};

//
// ─────────────────────────────────────────────────────────────
// Mutations - Password
// ─────────────────────────────────────────────────────────────
//

interface ChangePasswordVars {
  id: string;
  currentPassword?: string;
  newPassword: string;
}

export const useChangePassword =
  (): UseMutationResult<
    void,
    ApiError,
    ChangePasswordVars
  > => {
    return useMutation({
      mutationFn: ({
        id,
        currentPassword,
        newPassword,
      }) =>
        usersService.changePassword(id, {
          ...(currentPassword !== undefined && {
            currentPassword,
          }),
          newPassword,
        }),
    });
  };

//
// ─────────────────────────────────────────────────────────────
// Mutations - Roles
// ─────────────────────────────────────────────────────────────
//

interface RoleVars {
  id: string;
  role: RoleName;
}

export const useAddRole =
  (): UseMutationResult<
    PublicUser,
    ApiError,
    RoleVars
  > => {
    const qc = useQueryClient();

    return useMutation({
      mutationFn: ({ id, role }) =>
        usersService.addRole(id, role),

      onSuccess: (data) => {
        qc.setQueryData(
          usersKeys.detail(data.id),
          data,
        );

        void qc.invalidateQueries({
          queryKey: usersKeys.lists(),
        });
      },
    });
  };

export const useRemoveRole =
  (): UseMutationResult<
    PublicUser,
    ApiError,
    RoleVars
  > => {
    const qc = useQueryClient();

    return useMutation({
      mutationFn: ({ id, role }) =>
        usersService.removeRole(id, role),

      onSuccess: (data) => {
        qc.setQueryData(
          usersKeys.detail(data.id),
          data,
        );

        void qc.invalidateQueries({
          queryKey: usersKeys.lists(),
        });
      },
    });
  };

//
// ─────────────────────────────────────────────────────────────
// Mutations - Profiles
// ─────────────────────────────────────────────────────────────
//

interface CreateStudentProfileVars {
  id: string;
  input: {
    studentNumber: string;
    dateOfBirth?: string;
    gender?:
      | 'MALE'
      | 'FEMALE'
      | 'OTHER'
      | 'PREFER_NOT_TO_SAY';
    enrollmentDate?: string;
    guardianName?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    address?: string;
  };
}

export const useCreateStudentProfile =
  (): UseMutationResult<
    StudentProfile,
    ApiError,
    CreateStudentProfileVars
  > => {
    const qc = useQueryClient();

    return useMutation({
      mutationFn: ({ id, input }) =>
        usersService.createStudentProfile(
          id,
          input,
        ),

      onSuccess: (_data, { id }) => {
        void qc.invalidateQueries({
          queryKey: usersKeys.detail(id),
        });
      },
    });
  };

interface CreateTeacherProfileVars {
  id: string;
  input: {
    employeeNumber: string;
    hireDate?: string;
    department?: string;
    qualification?: string;
  };
}

export const useCreateTeacherProfile =
  (): UseMutationResult<
    TeacherProfile,
    ApiError,
    CreateTeacherProfileVars
  > => {
    const qc = useQueryClient();

    return useMutation({
      mutationFn: ({ id, input }) =>
        usersService.createTeacherProfile(
          id,
          input,
        ),

      onSuccess: (_data, { id }) => {
        void qc.invalidateQueries({
          queryKey: usersKeys.detail(id),
        });
      },
    });
  };