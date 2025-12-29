import { z } from 'zod';
import { insertWithdrawalSchema, insertSettingsSchema, withdrawals, settings, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  math: {
    question: {
      method: 'GET' as const,
      path: '/api/math/question',
      responses: {
        200: z.object({
          id: z.string(),
          question: z.string(),
        }),
      },
    },
    answer: {
      method: 'POST' as const,
      path: '/api/math/answer',
      input: z.object({
        questionId: z.string(),
        answer: z.number(),
      }),
      responses: {
        200: z.object({
          correct: z.boolean(),
          correctAnswer: z.number(),
          coinsChange: z.number(),
          newBalance: z.number(),
        }),
        400: errorSchemas.validation,
      },
    },
  },
  withdrawals: {
    list: {
      method: 'GET' as const,
      path: '/api/withdrawals',
      responses: {
        200: z.array(z.custom<typeof withdrawals.$inferSelect & { user: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/withdrawals',
      input: insertWithdrawalSchema,
      responses: {
        201: z.custom<typeof withdrawals.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    approve: {
      method: 'POST' as const,
      path: '/api/withdrawals/:id/approve',
      responses: {
        200: z.custom<typeof withdrawals.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    deny: {
      method: 'POST' as const,
      path: '/api/withdrawals/:id/deny',
      responses: {
        200: z.custom<typeof withdrawals.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/settings',
      input: insertSettingsSchema,
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  users: {
    stats: {
      method: 'GET' as const,
      path: '/api/users/stats',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type MathQuestionResponse = z.infer<typeof api.math.question.responses[200]>;
export type MathAnswerInput = z.infer<typeof api.math.answer.input>;
export type MathAnswerResponse = z.infer<typeof api.math.answer.responses[200]>;
export type WithdrawalResponse = z.infer<typeof api.withdrawals.create.responses[201]>;
export type SettingsResponse = z.infer<typeof api.settings.get.responses[200]>;
