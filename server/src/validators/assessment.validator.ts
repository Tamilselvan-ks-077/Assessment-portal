import { z } from 'zod';

const assessmentSettingsSchema = z.object({
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
  showImmediateResults: z.boolean().default(true),
  allowAnswerReview: z.boolean().default(true),
  maxAttempts: z.number().int().min(1).default(1),
  timeLimitMinutes: z.number().int().min(0).default(0),
  passingScorePercentage: z.number().int().min(0).max(100).default(70),
  requireParticipantEmail: z.boolean().default(true),
  requireParticipantId: z.boolean().default(false),
  enableAntiCheatWarnings: z.boolean().default(true),
}).partial();

export const createAssessmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(2000).optional().default(''),
  category: z.string().max(100).optional().default('General'),
  instructions: z.string().max(5000).optional(),
  accessCode: z.string().min(3).max(30).optional(),
  timeLimitMinutes: z.number().int().min(0).optional().default(0),
  passingScorePercentage: z.number().int().min(0).max(100).optional().default(70),
  maxAttempts: z.number().int().min(1).optional().default(1),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  shuffleQuestions: z.boolean().optional().default(false),
  shuffleOptions: z.boolean().optional().default(false),
  showImmediateResults: z.boolean().optional().default(true),
  allowAnswerReview: z.boolean().optional().default(true),
  requireParticipantEmail: z.boolean().optional().default(true),
  requireParticipantId: z.boolean().optional().default(false),
  enableAntiCheatWarnings: z.boolean().optional().default(true),
  settings: assessmentSettingsSchema.optional(),
});

export const updateAssessmentSchema = createAssessmentSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
});

export const assessmentQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('20'),
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;
export type AssessmentQueryInput = z.infer<typeof assessmentQuerySchema>;
