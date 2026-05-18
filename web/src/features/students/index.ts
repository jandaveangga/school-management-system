// ─── Pages ───────────────────────────────────────────────────
export { StudentsListPage } from './pages/StudentsListPage';

// ─── Hooks ───────────────────────────────────────────────────
export {
  useStudentsList,
  useStudent,
  studentsKeys,
} from './hooks';

// ─── Service ─────────────────────────────────────────────────
export { studentsService } from './services';

// ─── Schemas & Types ─────────────────────────────────────────
export {
  listStudentsQuerySchema,
  studentsListResponseSchema,
  studentSchema,
  type ListStudentsQuery,
  type Student,
  type StudentProfile,
} from './schemas';
