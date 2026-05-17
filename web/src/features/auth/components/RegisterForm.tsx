import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';

import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/Input';
import { PasswordInput } from '@/components/PasswordInput';
import { errorMessage } from '@/lib/api-error';
import { toast } from '@/store/toast-store';

import { registerFormSchema, type RegisterFormValues } from '../schemas';
import { useRegister } from '../hooks/useRegister';

interface RegisterFormProps {
  onSuccess: () => void;
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps): ReactElement => {
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
    mode: 'onSubmit',
  });

  const onSubmit = handleSubmit((data) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Account created');
        onSuccess();
      },
      onError: (err) => {
        toast.error(errorMessage(err));
      },
    });
  });

  const isPending = registerMutation.isPending || isSubmitting;

  return (
    <form onSubmit={onSubmit} noValidate>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {/* Name fields */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-3)',
          }}
        >
          <FormField
            label="First name"
            htmlFor="register-firstName"
            required
            error={errors.firstName?.message}
          >
            <Input
              id="register-firstName"
              autoComplete="given-name"
              autoFocus
              invalid={errors.firstName !== undefined}
              {...register('firstName')}
            />
          </FormField>

          <FormField
            label="Last name"
            htmlFor="register-lastName"
            required
            error={errors.lastName?.message}
          >
            <Input
              id="register-lastName"
              autoComplete="family-name"
              invalid={errors.lastName !== undefined}
              {...register('lastName')}
            />
          </FormField>
        </div>

        {/* Email */}
        <FormField
          label="Email"
          htmlFor="register-email"
          required
          error={errors.email?.message}
        >
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            invalid={errors.email !== undefined}
            {...register('email')}
          />
        </FormField>

        {/* Phone */}
        <FormField
          label="Phone"
          htmlFor="register-phone"
          hint="Optional"
          error={errors.phone?.message}
        >
          <Input
            id="register-phone"
            type="tel"
            autoComplete="tel"
            invalid={errors.phone !== undefined}
            {...register('phone')}
          />
        </FormField>

        {/* Password */}
        <FormField
          label="Password"
          htmlFor="register-password"
          required
          hint="At least 8 characters"
          error={errors.password?.message}
        >
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            invalid={errors.password !== undefined}
            {...register('password')}
          />
        </FormField>

        {/* Confirm Password */}
        <FormField
          label="Confirm password"
          htmlFor="register-confirmPassword"
          required
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="register-confirmPassword"
            autoComplete="new-password"
            invalid={errors.confirmPassword !== undefined}
            {...register('confirmPassword')}
          />
        </FormField>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isPending}
          loadingText="Creating account…"
        >
          Create account
        </Button>
      </div>
    </form>
  );
};