import * as yup from 'yup'

const buildSignupSchema = t => yup.object({
  username: yup
    .string()
    .trim()
    .min(3, t('validation.usernameLen'))
    .max(20, t('validation.usernameLen'))
    .required(t('validation.required')),
  password: yup
    .string()
    .min(6, t('validation.passwordMin'))
    .required(t('validation.required')),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], t('validation.passwordsMustMatch'))
    .required(t('validation.required')),
})

export default buildSignupSchema
