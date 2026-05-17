import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthLayout } from '../components/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage = (): ReactElement => {
  const navigate = useNavigate();

  const handleSuccess = (): void => {
    void navigate('/dashboard', { replace: true });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Self-signup creates a student account. Staff accounts are issued by an administrator."
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <RegisterForm onSuccess={handleSuccess} />
    </AuthLayout>
  );
};