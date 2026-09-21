import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().url().optional().nullable(),
  organization: z.string().max(150).optional(),
  currentPassword: z.string().min(6).optional(),
  newPassword: z.string().min(6).max(100).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
