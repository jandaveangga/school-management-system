import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';

import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { errorMessage } from '@/lib/api-error';
import { toast } from '@/store/toast-store';

import type { PublicUser } from '@/features/auth/schemas';
import {
  useCreateStudentProfile,
  useCreateTeacherProfile,
} from '../hooks';

import {
  studentProfileFormSchema,
  teacherProfileFormSchema,
  type StudentProfileFormValues,
  type TeacherProfileFormValues,
} from '../schemas';

import './ProfileSection.css';

interface ProfileSectionProps {
  user: PublicUser;
}

const StudentProfileForm = ({
  user,
}: {
  user: PublicUser;
}): ReactElement => {
  const create = useCreateStudentProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileFormSchema),
    defaultValues: {
      studentNumber: '',
      gender: undefined,
      dateOfBirth: '',
      enrollmentDate: '',
      guardianName: '',
      guardianPhone: '',
      guardianEmail: '',
      address: '',
    },
  });

  const onSubmit = handleSubmit((data) => {
    const trimmed = (s: string | undefined): string | undefined =>
      s !== undefined && s !== '' ? s : undefined;

    const input: Parameters<typeof create.mutate>[0]['input'] = {
      studentNumber: data.studentNumber,
      ...(trimmed(data.dateOfBirth) !== undefined && {
        dateOfBirth: data.dateOfBirth,
      }),
      ...(data.gender !== undefined && { gender: data.gender }),
      ...(trimmed(data.enrollmentDate) !== undefined && {
        enrollmentDate: data.enrollmentDate,
      }),
      ...(trimmed(data.guardianName) !== undefined && {
        guardianName: data.guardianName,
      }),
      ...(trimmed(data.guardianPhone) !== undefined && {
        guardianPhone: data.guardianPhone,
      }),
      ...(trimmed(data.guardianEmail) !== undefined && {
        guardianEmail: data.guardianEmail,
      }),
      ...(trimmed(data.address) !== undefined && {
        address: data.address,
      }),
    };

    create.mutate(
      { id: user.id, input },
      {
        onSuccess: () => toast.success('Student profile created'),
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  });

  return (
    <form onSubmit={onSubmit} noValidate className="profile-section__form">
      <FormField
        label="Student number"
        htmlFor="student-number"
        required
        error={errors.studentNumber?.message}
      >
        <Input
          id="student-number"
          invalid={errors.studentNumber !== undefined}
          {...register('studentNumber')}
        />
      </FormField>

      <div className="profile-section__row">
        <FormField
          label="Date of birth"
          htmlFor="student-dob"
          error={errors.dateOfBirth?.message}
        >
          <Input id="student-dob" type="date" {...register('dateOfBirth')} />
        </FormField>

        <FormField
          label="Gender"
          htmlFor="student-gender"
          error={errors.gender?.message}
        >
          <Select id="student-gender" {...register('gender')}>
            <option value="">—</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </Select>
        </FormField>
      </div>

      <FormField
        label="Enrollment date"
        htmlFor="student-enrollment"
        error={errors.enrollmentDate?.message}
      >
        <Input
          id="student-enrollment"
          type="date"
          {...register('enrollmentDate')}
        />
      </FormField>

      <FormField
        label="Guardian name"
        htmlFor="student-guardianName"
        error={errors.guardianName?.message}
      >
        <Input id="student-guardianName" {...register('guardianName')} />
      </FormField>

      <div className="profile-section__row">
        <FormField
          label="Guardian phone"
          htmlFor="student-guardianPhone"
          error={errors.guardianPhone?.message}
        >
          <Input
            id="student-guardianPhone"
            type="tel"
            {...register('guardianPhone')}
          />
        </FormField>

        <FormField
          label="Guardian email"
          htmlFor="student-guardianEmail"
          error={errors.guardianEmail?.message}
        >
          <Input
            id="student-guardianEmail"
            type="email"
            {...register('guardianEmail')}
          />
        </FormField>
      </div>

      <FormField
        label="Address"
        htmlFor="student-address"
        error={errors.address?.message}
      >
        <Input id="student-address" {...register('address')} />
      </FormField>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" isLoading={create.isPending || isSubmitting}>
          Create student profile
        </Button>
      </div>
    </form>
  );
};

const TeacherProfileForm = ({
  user,
}: {
  user: PublicUser;
}): ReactElement => {
  const create = useCreateTeacherProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeacherProfileFormValues>({
    resolver: zodResolver(teacherProfileFormSchema),
    defaultValues: {
      employeeNumber: '',
      hireDate: '',
      department: '',
      qualification: '',
    },
  });

  const onSubmit = handleSubmit((data) => {
    const trimmed = (s: string | undefined): string | undefined =>
      s !== undefined && s !== '' ? s : undefined;

    const input: Parameters<typeof create.mutate>[0]['input'] = {
      employeeNumber: data.employeeNumber,
      ...(trimmed(data.hireDate) !== undefined && {
        hireDate: data.hireDate,
      }),
      ...(trimmed(data.department) !== undefined && {
        department: data.department,
      }),
      ...(trimmed(data.qualification) !== undefined && {
        qualification: data.qualification,
      }),
    };

    create.mutate(
      { id: user.id, input },
      {
        onSuccess: () => toast.success('Teacher profile created'),
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  });

  return (
    <form onSubmit={onSubmit} noValidate className="profile-section__form">
      <FormField
        label="Employee number"
        htmlFor="teacher-employee"
        required
        error={errors.employeeNumber?.message}
      >
        <Input
          id="teacher-employee"
          invalid={errors.employeeNumber !== undefined}
          {...register('employeeNumber')}
        />
      </FormField>

      <div className="profile-section__row">
        <FormField
          label="Hire date"
          htmlFor="teacher-hireDate"
          error={errors.hireDate?.message}
        >
          <Input
            id="teacher-hireDate"
            type="date"
            {...register('hireDate')}
          />
        </FormField>

        <FormField
          label="Department"
          htmlFor="teacher-department"
          error={errors.department?.message}
        >
          <Input id="teacher-department" {...register('department')} />
        </FormField>
      </div>

      <FormField
        label="Qualification"
        htmlFor="teacher-qualification"
        error={errors.qualification?.message}
      >
        <Input
          id="teacher-qualification"
          {...register('qualification')}
        />
      </FormField>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" isLoading={create.isPending || isSubmitting}>
          Create teacher profile
        </Button>
      </div>
    </form>
  );
};

export const ProfileSection = ({
  user,
}: ProfileSectionProps): ReactElement => {
  const isStudent = user.roles.includes('STUDENT');
  const isTeacher = user.roles.includes('TEACHER');

  if (!isStudent && !isTeacher) {
    return (
      <p
        style={{
          color: 'var(--color-fg-muted)',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        This user has no STUDENT or TEACHER role. Profiles are only available
        for those roles — assign one above first.
      </p>
    );
  }

  return (
    <div className="profile-section">
      {isStudent && (
        <details className="profile-section__details" open>
          <summary>Student profile</summary>
          <div className="profile-section__panel">
            <StudentProfileForm user={user} />
          </div>
        </details>
      )}

      {isTeacher && (
        <details className="profile-section__details" open>
          <summary>Teacher profile</summary>
          <div className="profile-section__panel">
            <TeacherProfileForm user={user} />
          </div>
        </details>
      )}
    </div>
  );
};