import { z } from 'zod';

export const startAttemptSchema = z.object({
  accessCode: z.string().min(1).optional(),
  participant: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Valid email is required'),
    studentId: z.string().optional(),
    organization: z.string().optional(),
  }),
});

export const saveAnswerSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  selectedOptionIds: z.array(z.string()).optional().default([]),
  textAnswer: z.string().optional().nullable(),
  isMarkedForReview: z.boolean().optional().default(false),
});

export const submitAttemptSchema = z.object({
  timeSpentSeconds: z.number().int().min(0).optional().default(0),
});

export type StartAttemptInput = z.infer<typeof startAttemptSchema>;
export type SaveAnswerInput = z.infer<typeof saveAnswerSchema>;
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
