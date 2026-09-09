import { z } from "zod";
export const loginSchema = z.object({
    email: z.email().min(1, "Введите email"),
    password: z.string().min(8, "Введите пароль")
})

export type TLoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
    // name: z.string().min(2, "Минимум 2 символа").max(50, "Максимум 50 символов"),
    email: z.email().min(1, "Введите email"),
    password: z
        .string()
        .min(8, "Минимум 8 символов")
        .regex(/[A-Z]/, 'Должна быть хотя бы одна заглавная буква')
        .regex(/[0-9]/, 'Должна быть хотя бы одна цифра'),
    confirmPassword: z
        .string()
        .min(8, "Минимум 8 символов")
        .regex(/[A-Z]/, 'Должна быть хотя бы одна заглавная буква')
        .regex(/[0-9]/, 'Должна быть хотя бы одна цифра'),
}).refine((data) => data.password === data.confirmPassword, {
    error: "Пароли не совпадают",
    path: ["confirmPassword"],
})

export type TRegisterFormValues = z.infer<typeof registerSchema>