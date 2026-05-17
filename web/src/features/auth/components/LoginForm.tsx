import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';

import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/Input';
import { PasswordInput } from '@/components/PasswordInput';
import { errorMessage } from '@/lib/api-error';
import { toast } from '@/store/toast-store';

import { loginFormSchema, type LoginFormValues } from '../schemas';
import { useLogin } from '../hooks/useLogin';

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps): ReactElement => {
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onSubmit',
  });

  const onSubmit = handleSubmit((data) => {
    login.mutate(data, {
      onSuccess: () => {
        toast.success('Signed in');
        onSuccess();
      },
      onError: (err) => {
        toast.error(errorMessage(err));
      },
    });
  });

  const isPending = login.isPending || isSubmitting;

  return (
    <form onSubmit={onSubmit} noValidate>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <FormField
          label="Email"
          htmlFor="login-email"
          required
          error={errors.email?.message}
        >
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            autoFocus
            invalid={errors.email !== undefined}
            aria-describedby={
              errors.email !== undefined ? 'login-email-error' : undefined
            }
            {...register('email')}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="login-password"
          required
          error={errors.password?.message}
        >
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            invalid={errors.password !== undefined}
            aria-describedby={
              errors.password !== undefined
                ? 'login-password-error'
                : undefined
            }
            {...register('password')}
          />
        </FormField>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isPending}
          loadingText="Signing in…"
        >
          Sign in
        </Button>
      </div>
    </form>
  );
};