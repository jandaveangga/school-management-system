import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { ReactElement } from 'react';

import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/Input';
import { errorMessage } from '@/lib/api-error';
import { toast } from '@/store/toast-store';

import type { PublicUser } from '@/features/auth/schemas';

import { useUpdateUser } from '../hooks';

import {
  editUserFormSchema,
  type EditUserFormValues,
} from '../schemas';

interface UserEditFormProps {
  user: PublicUser;
}

export const UserEditForm = ({
  user,
}: UserEditFormProps): ReactElement => {
  const update = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isDirty,
      isSubmitting,
    },
    reset,
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? '',
      isActive: user.isActive,
    },
  });

  const onSubmit = handleSubmit((data) => {
    // Normalize: trim phone, treat '' as explicit null clear.
    const phone =
      data.phone === undefined
        ? undefined
        : data.phone === ''
          ? null
          : data.phone;

    const patch = {
      ...(data.email !== undefined &&
        data.email !== user.email && {
          email: data.email,
        }),

      ...(data.firstName !== undefined &&
        data.firstName !== user.firstName && {
          firstName: data.firstName,
        }),

      ...(data.lastName !== undefined &&
        data.lastName !== user.lastName && {
          lastName: data.lastName,
        }),

      ...(phone !== undefined &&
        phone !== user.phone && {
          phone,
        }),

      ...(data.isActive !== undefined &&
        data.isActive !== user.isActive && {
          isActive: data.isActive,
        }),
    };

    if (Object.keys(patch).length === 0) {
      toast.info('No changes');
      return;
    }

    update.mutate(
      { id: user.id, patch },
      {
        onSuccess: (updated) => {
          toast.success('User updated');

          reset({
            email: updated.email,
            firstName: updated.firstName,
            lastName: updated.lastName,
            phone: updated.phone ?? '',
            isActive: updated.isActive,
          });
        },
        onError: (err) => {
          toast.error(errorMessage(err));
        },
      },
    );
  });

  const isPending =
    update.isPending || isSubmitting;

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
            htmlFor="edit-firstName"
            error={errors.firstName?.message}
          >
            <Input
              id="edit-firstName"
              invalid={
                errors.firstName !== undefined
              }
              {...register('firstName')}
            />
          </FormField>

          <FormField
            label="Last name"
            htmlFor="edit-lastName"
            error={errors.lastName?.message}
          >
            <Input
              id="edit-lastName"
              invalid={
                errors.lastName !== undefined
              }
              {...register('lastName')}
            />
          </FormField>
        </div>

        <FormField
          label="Email"
          htmlFor="edit-email"
          error={errors.email?.message}
        >
          <Input
            id="edit-email"
            type="email"
            invalid={
              errors.email !== undefined
            }
            {...register('email')}
          />
        </FormField>

        <FormField
          label="Phone"
          htmlFor="edit-phone"
          hint="Empty clears the phone number"
          error={errors.phone?.message}
        >
          <Input
            id="edit-phone"
            type="tel"
            invalid={
              errors.phone !== undefined
            }
            {...register('phone')}
          />
        </FormField>

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
            id="edit-isActive"
            type="checkbox"
            {...register('isActive')}
          />
          <span>Active</span>
        </label>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: 'var(--space-2)',
          }}
        >
          <Button
            type="submit"
            isLoading={isPending}
            disabled={!isDirty}
            loadingText="Saving…"
          >
            Save changes
          </Button>
        </div>
      </div>
    </form>
  );
};