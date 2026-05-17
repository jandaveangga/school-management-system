import { useState, type ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Confirm } from '@/components/Confirm';
import { FormField } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { PasswordInput } from '@/components/PasswordInput';
import { Spinner } from '@/components/Spinner';

import { errorMessage } from '@/lib/api-error';
import { toast } from '@/store/toast-store';

import { useAuth } from '@/features/auth';

import {
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from '../schemas';

import {
  useChangePassword,
  useDeleteUser,
  useUser,
} from '../hooks';

import { UserEditForm } from '../components/UserEditForm';
import { RoleManager } from '../components/RoleManager';
import { ProfileSection } from '../components/ProfileSection';

import './UserDetailPage.css';

export const UserDetailPage = (): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const userQuery = useUser(id);
  const deleteUser = useDeleteUser();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  if (userQuery.isLoading) {
    return (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Spinner label="Loading user" />
      </div>
    );
  }

  if (userQuery.isError || userQuery.data === undefined) {
    return (
      <>
        <PageHeader
          eyebrow={<Link to="/users">← Back to users</Link>}
          title="User not found"
        />

        <p style={{ color: 'var(--color-fg-muted)' }}>
          {userQuery.error
            ? errorMessage(userQuery.error)
            : 'This user does not exist or has been deleted.'}
        </p>
      </>
    );
  }

  const user = userQuery.data;
  const isSelf =
    currentUser !== null &&
    currentUser.id === user.id;

  const onConfirmDelete = (): void => {
    deleteUser.mutate(user.id, {
      onSuccess: () => {
        toast.success('User deleted');
        void navigate('/users', {
          replace: true,
        });
      },
      onError: (err) => {
        toast.error(errorMessage(err));
      },
    });
  };

  return (
    <>
      <PageHeader
        eyebrow={
          <Link
            to="/users"
            style={{
              color: 'var(--color-fg-muted)',
            }}
          >
            ← Back to users
          </Link>
        }
        title={`${user.firstName} ${user.lastName}`}
        description={user.email}
      />

      <div className="user-detail__layout">
        <Section title="Basic info">
          <UserEditForm user={user} />
        </Section>

        <Section
          title="Roles"
          description="Add or remove RBAC roles. Changes take effect on next login."
        >
          <RoleManager user={user} />
        </Section>

        <Section
          title="Profile"
          description="Attach a Student or Teacher profile."
        >
          <ProfileSection user={user} />
        </Section>

        <Section
          title="Password"
          description="Set a new password directly. The user is signed out of every session on save."
        >
          <Button
            variant="secondary"
            onClick={() => setPasswordOpen(true)}
          >
            Reset password
          </Button>
        </Section>

        <Section title="Status" tone="muted">
          <div className="user-detail__status">
            <span>
              {user.isActive ? (
                <Badge variant="success">
                  Active
                </Badge>
              ) : (
                <Badge variant="neutral">
                  Inactive
                </Badge>
              )}
            </span>

            <span
              style={{
                color: 'var(--color-fg-muted)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              Created{' '}
              {new Intl.DateTimeFormat(undefined, {
                dateStyle: 'medium',
              }).format(user.createdAt)}{' '}
              · Last login{' '}
              {user.lastLoginAt === null
                ? 'never'
                : new Intl.DateTimeFormat(
                    undefined,
                    { dateStyle: 'medium' },
                  ).format(user.lastLoginAt)}
            </span>
          </div>
        </Section>

        {!isSelf && (
          <Section
            title="Danger zone"
            description="Soft-deletes the user and revokes every active session."
            tone="danger"
          >
            <Button
              variant="danger"
              onClick={() => setConfirmDelete(true)}
            >
              Delete user
            </Button>
          </Section>
        )}
      </div>

      <Confirm
        open={confirmDelete}
        title={`Delete ${user.firstName} ${user.lastName}?`}
        description="This soft-deletes the user and revokes every active session."
        confirmLabel="Delete user"
        variant="danger"
        isPending={deleteUser.isPending}
        onConfirm={onConfirmDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <ResetPasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        userId={user.id}
        isSelf={isSelf}
      />
    </>
  );
};

//
// ─────────────────────────────────────────────
// Section helper
// ─────────────────────────────────────────────
//

interface SectionProps {
  title: string;
  description?: string;
  tone?: 'default' | 'muted' | 'danger';
  children: ReactElement | ReactElement[] | string;
}

const Section = ({
  title,
  description,
  tone = 'default',
  children,
}: SectionProps): ReactElement => {
  return (
    <section
      className={`user-detail__section user-detail__section--${tone}`}
    >
      <header className="user-detail__section-header">
        <h2 className="user-detail__section-title">
          {title}
        </h2>

        {description !== undefined && (
          <p className="user-detail__section-description">
            {description}
          </p>
        )}
      </header>

      <div className="user-detail__section-body">
        {children}
      </div>
    </section>
  );
};

//
// ─────────────────────────────────────────────
// Reset password modal
// ─────────────────────────────────────────────
//

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  isSelf: boolean;
}

const ResetPasswordModal = ({
  open,
  onClose,
  userId,
  isSelf,
}: ResetPasswordModalProps): ReactElement => {
  const change = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
    reset,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (
      isSelf &&
      (!data.currentPassword ||
        data.currentPassword === '')
    ) {
      toast.error(
        'Current password is required when changing your own password',
      );
      return;
    }

    change.mutate(
      {
        id: userId,
        ...(isSelf &&
        data.currentPassword
          ? {
              currentPassword:
                data.currentPassword,
            }
          : {}),
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          toast.success(
            'Password updated. The user has been signed out of every session.',
          );
          reset();
          onClose();
        },
        onError: (err) => {
          toast.error(errorMessage(err));
        },
      },
    );
  });

  const isPending =
    change.isPending || isSubmitting;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset password"
      size="sm"
    >
      <form onSubmit={onSubmit} noValidate>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {isSelf && (
            <FormField
              label="Current password"
              htmlFor="reset-current"
              required
              error={
                errors.currentPassword?.message
              }
            >
              <PasswordInput
                id="reset-current"
                autoComplete="current-password"
                {...register('currentPassword')}
              />
            </FormField>
          )}

          <FormField
            label="New password"
            htmlFor="reset-new"
            required
            hint="Minimum 8 characters"
            error={
              errors.newPassword?.message
            }
          >
            <PasswordInput
              id="reset-new"
              autoComplete="new-password"
              invalid={
                errors.newPassword !== undefined
              }
              {...register('newPassword')}
            />
          </FormField>

          <FormField
            label="Confirm new password"
            htmlFor="reset-confirm"
            required
            error={
              errors.confirmNewPassword?.message
            }
          >
            <PasswordInput
              id="reset-confirm"
              autoComplete="new-password"
              invalid={
                errors.confirmNewPassword !==
                undefined
              }
              {...register('confirmNewPassword')}
            />
          </FormField>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-2)',
            }}
          >
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              isLoading={isPending}
              loadingText="Saving…"
            >
              Update password
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};