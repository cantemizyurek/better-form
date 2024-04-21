import { z } from 'zod'

export function initialFormCheck<Schema extends z.ZodRawShape, State>(
  formData: FormData,
  checker: z.ZodObject<Schema>
) {
  const formValues = Object.fromEntries(formData.entries())
  const schema = checker.safeParse(formValues)
  if (schema.success) return true
  return schema.error.flatten().fieldErrors as Awaited<State>
}

export function formError(field: string, error: string) {
  return { [field]: [error] }
}
