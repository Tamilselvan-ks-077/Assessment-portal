import { z } from 'zod';

export const questionOptionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean().default(false),
  order: z.number().int().optional().default(0),
});

export const createQuestionSchema = z.object({
  text: z.string().min(2, 'Question text must be at least 2 characters'),
  type: z.enum([
    'SINGLE_CHOICE',
    'MULTIPLE_CHOICE',
    'TRUE_FALSE',
    'SHORT_ANSWER',
    'LONG_ANSWER',
  ]),
  marks: z.number().int().min(1).default(1),
  order: z.number().int().optional().default(0),
  explanation: z.string().max(2000).optional().nullable(),
  isRequired: z.boolean().optional().default(true),
  options: z.array(questionOptionSchema).optional().default([]),
  correctAnswers: z.array(z.string()).optional(),
});

export const updateQuestionSchema = createQuestionSchema.partial();

export const reorderQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().min(0),
    })
  ),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ReorderQuestionsInput = z.infer<typeof reorderQuestionsSchema>;
