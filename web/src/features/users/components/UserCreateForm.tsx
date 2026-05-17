import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { ReactElement } from 'react';

import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/Input';
import { PasswordInput } from '@/components/PasswordInput';
import { errorMessage } from '@/lib/api-error';
import { toast } from '@/store/toast-store';

import {
  roleNameSchema,
  type RoleName,
} from '@/features/auth/schemas';

import { useCreateUser } from '../hooks';

import {
  createUserFormSchema,
  type CreateUserFormValues,
} from '../schemas';

interface UserCreateFormProps {
  onSuccess: (id: string) => void;
  onCancel?: () => void;
}

const ALL_ROLES = roleNameSchema.options;

export const UserCreateForm = ({
  onSuccess,
  onCancel,
}: UserCreateFormProps): ReactElement => {
  const create = useCreateUser();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      isActive: true,
      roles: [],
    },
  });

  const onSubmit = handleSubmit((data) => {
    const payload = {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      isActive: data.isActive,
      roles: data.roles,
      ...(data.phone !== undefined &&
        data.phone !== '' && {
          phone: data.phone,
        }),
    };

    create.mutate(payload, {
      onSuccess: (user) => {
        toast.success('User created');
        onSuccess(user.id);
      },
      onError: (err) => {
        toast.error(errorMessage(err));
      },
    });
  });

  const isPending =
    create.isPending || isSubmitting;

  return (
    <form onSubmit={onSubmit} noValidate>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-3)',
          }}
        >
          <FormField
            label="First name"
            htmlFor="user-firstName"
            required
            error={errors.firstName?.message}
          >
            <Input
              id="user-firstName"
              autoComplete="given-name"
              autoFocus
              invalid={
                errors.firstName !== undefined
              }
              {...register('firstName')}
            />
          </FormField>

          <FormField
            label="Last name"
            htmlFor="user-lastName"
            required
            error={errors.lastName?.message}
          >
            <Input
              id="user-lastName"
              autoComplete="family-name"
              invalid={
                errors.lastName !== undefined
              }
              {...register('lastName')}
            />
          </FormField>
        </div>

        <FormField
          label="Email"
          htmlFor="user-email"
          required
          error={errors.email?.message}
        >
          <Input
            id="user-email"
            type="email"
            autoComplete="email"
            invalid={
              errors.email !== undefined
            }
            {...register('email')}
          />
        </FormField>

        <FormField
          label="Phone"
          htmlFor="user-phone"
          hint="Optional"
          error={errors.phone?.message}
        >
          <Input
            id="user-phone"
            type="tel"
            autoComplete="tel"
            invalid={
              errors.phone !== undefined
            }
            {...register('phone')}
          />
        </FormField>

        <FormField
          label="Initial password"
          htmlFor="user-password"
          required
          hint="Minimum 8 characters. Communicate this to the user out of band."
          error={errors.password?.message}
        >
          <PasswordInput
            id="user-password"
            autoComplete="new-password"
            invalid={
              errors.password !== undefined
            }
            {...register('password')}
          />
        </FormField>

        <FormField
          label="Roles"
          htmlFor="user-roles"
          required
          error={errors.roles?.message}
        >
          <Controller
            control={control}
            name="roles"
            render={({ field }) => (
              <div
                id="user-roles"
                role="group"
                aria-label="Roles"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)',
                }}
              >
                {ALL_ROLES.map((role) => {
                  const checked =
                    field.value.includes(role);

                  return (
                    <label
                      key={role}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        padding:
                          'var(--space-2) var(--space-3)',
                        borderRadius:
                          'var(--radius-md)',
                        border: `1px solid ${
                          checked
                            ? 'var(--color-accent)'
                            : 'var(--color-border-strong)'
                        }`,
                        background: checked
                          ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)'
                          : 'var(--color-bg)',
                        fontSize:
                          'var(--font-size-sm)',
                        fontWeight:
                          'var(--font-weight-medium)',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        value={role}
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target
                            .checked
                            ? [
                                ...field.value,
                                role as RoleName,
                              ]
                            : field.value.filter(
                                (r) =>
                                  r !== role,
                              );

                          field.onChange(next);
                        }}
                      />
                      <span>{role}</span>
                    </label>
                  );
                })}
              </div>
            )}
          />
        </FormField>

        <FormField label="" htmlFor="user-isActive">
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
            }}
          >
            <input
              id="user-isActive"
              type="checkbox"
              {...register('isActive')}
            />
            <span>
              Active (can sign in immediately)
            </span>
          </label>
        </FormField>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-2)',
          }}
        >
          {onCancel !== undefined && (
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            isLoading={isPending}
            loadingText="Creating…"
          >
            Create user
          </Button>
        </div>
      </div>
    </form>
  );
};