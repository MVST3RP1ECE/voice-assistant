import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { BaseUIEvent } from "@base-ui/react/types"
import { usePingQuery } from "@/features/auth/AuthAPI"
import { type TLoginFormValues, loginSchema } from "@/schema/authSchema"
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from "react-hook-form"


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const { control, handleSubmit, formState: { errors }, getValues } = useForm<TLoginFormValues>({
    defaultValues: {
      email: "",
      password: ""
    },
    resolver: zodResolver(loginSchema)
  })

  // const { data, isError, isLoading, status, originalArgs, endpointName, currentData } = usePingQuery();

  // Придётся писать обёртку для работы с потоками, потому что RTK Query не поддерживает их напрямую. 
  // Поэтому используем обычный fetch в данном примере.
  async function handleClick(e: BaseUIEvent<React.MouseEvent<HTMLButtonElement, MouseEvent>>) {
    e.preventDefault();
    // const response = await fetch("http://localhost:8080/api/v1/ping", {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });
    const { email, password } = getValues();

    const response = await fetch("http://localhost:8080/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    console.log(await response.json())

    // if (!response.body) {
    //   console.log('Поток не поддерживается');
    //   return;
    // }

    // const reader = response.body.getReader();
    // const decoder = new TextDecoder(); // Для перевода байтов в текст

    // try {
    //   while (true) {
    //     const { done, value } = await reader.read();

    //     if (done) {
    //       break; // Поток закончился
    //     }

    //     // Декодируем и обрабатываем чанк данных
    //     const chunk = decoder.decode(value, { stream: true });
    //     console.log('Получена часть данных:', chunk);
    //   }
    // } catch (error) {
    //   console.error('Ошибка при чтении потока:', error);
    // }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Войдите в свой аккаунт</CardTitle>
          <CardDescription>
            Введите свой адрес электронной почты ниже, чтобы войти в свой аккаунт
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Controller
                  name="email"
                  control={control}
                  rules={{ required: "Введите email" }}
                  render={({ field }) => (
                    <Input
                      id="email"
                      type="email"
                      placeholder="youremail@example.com"
                      required
                      {...field}
                    />
                  )}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Пароль</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Забыли пароль?
                  </a>
                </div>
                <Controller
                  name="password"
                  control={control}
                  rules={{ required: "Введите пароль" }}
                  render={({ field }) => (
                    <Input id="password" type="password" required {...field} />
                  )}
                />
              </Field>
              <Field>
                <Button type="submit" onClick={(e) => handleClick(e)}>Войти</Button>
                <Button variant="outline" type="button">
                  Войти с помощью Google
                </Button>
                <FieldDescription className="text-center">
                  У вас нет аккаунта? <a href="/register">Зарегистрироваться</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
