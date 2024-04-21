import { useEffect, useMemo, useState } from 'react'
// @ts-ignore
import { useFormState } from 'react-dom'
import { z } from 'zod'

export function useBetterForm<Schema extends z.ZodRawShape, State, Payload>({
  checker,
  action,
  onSuccessfulSubmit,
  defaultValues,
}: {
  checker: z.ZodObject<Schema>
  action: (state: Awaited<State>, payload: Payload) => State | Promise<State>
  onSuccessfulSubmit?: () => void
  defaultValues: Record<keyof Schema, any>
}) {
  const initialState = useMemo(() => {
    const schema = checker.safeParse({})
    if (schema.success) return {} as Awaited<State>
    return schema.error.flatten().fieldErrors as Awaited<State>
  }, [])

  const [formErrors, formAction] = useFormState(action, initialState)
  const [focusedFields, setFocusedFields] = useState(
    {} as Record<keyof Schema, boolean | undefined>
  )
  const [formValues, setFormValues] = useState(defaultValues)
  const [currentFormErrors, setCurrentFormErrors] = useState(formErrors)

  useEffect(() => {
    if (formErrors === true) {
      onSuccessfulSubmit?.()
      return setCurrentFormErrors({} as Awaited<State>)
    }
    setCurrentFormErrors(formErrors)
  }, [formErrors])

  useEffect(() => {
    const schema = checker.safeParse(formValues)
    if (schema.success) return setCurrentFormErrors({} as Awaited<State>)
    setCurrentFormErrors(schema.error.flatten().fieldErrors as Awaited<State>)
  }, [formValues])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    console.log(e.target)
    const schema = checker.safeParse(formValues)
    if (schema.success)
      return formAction(new FormData(e.target as HTMLFormElement) as Payload)
    setCurrentFormErrors(schema.error.flatten().fieldErrors as Awaited<State>)
  }

  function register(key: keyof Schema) {
    return {
      value: formValues[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues((prev) => ({ ...prev, [key]: e.target.value }))
      },
      onBlur: () => {
        setFocusedFields((prev) => ({ ...prev, [key]: true }))
      },
      name: key,
    }
  }

  function reset() {
    setFormValues(defaultValues)
    setCurrentFormErrors({} as Awaited<State>)
  }

  return {
    formErrors: currentFormErrors as Record<keyof Schema, string[]>,
    focusedFields,
    register,
    submit,
    reset,
  }
}
