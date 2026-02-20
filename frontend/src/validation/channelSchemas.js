import * as yup from 'yup'

export const getAddChannelSchema = (t, existingNames) => yup.object({
  name: yup
    .string()
    .trim()
    .min(3, t('validation.usernameLen'))
    .max(20, t('validation.usernameLen'))
    .required(t('validation.required'))
    .test('unique', t('validation.mustBeUnique'), value => {
      const v = (value ?? '').trim().toLowerCase()
      return !(existingNames ?? []).includes(v)
    }),
})

export const getRenameChannelSchema = (t, initialName, normalizedExisting) => yup.object({
  name: yup
    .string()
    .transform(v => (v ?? '').trim())
    .min(3, t('validation.usernameLen'))
    .max(20, t('validation.usernameLen'))
    .required(t('validation.required'))
    .test('unique', t('validation.mustBeUnique'), value => {
      const v = String(value ?? '').trim().toLowerCase()
      const init = String(initialName ?? '').trim().toLowerCase()
      if (v === init) return true
      return !(normalizedExisting ?? []).includes(v)
    }),
})
