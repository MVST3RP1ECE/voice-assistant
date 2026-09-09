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

export function RegisterForm({ ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Создайте аккаунт</CardTitle>
        <CardDescription>
          Введите свои данные ниже, чтобы создать аккаунт
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Имя</FieldLabel>
              <Input id="name" type="text" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Почта</FieldLabel>
              <Input
                id="email"
                type="email"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Пароль</FieldLabel>
              <Input id="password" type="password" required />
              <FieldDescription>
                Должен содержать не менее 8 символов.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Подтвердите пароль
              </FieldLabel>
              <Input id="confirm-password" type="password" required />
              <FieldDescription>Пожалуйста, подтвердите свой пароль.</FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">Создать аккаунт</Button>
                <Button variant="outline" type="button">
                  Войти с помощью Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Уже есть аккаунт? <a href="/login">Войти</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
