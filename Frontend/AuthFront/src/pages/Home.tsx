import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function Home() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          {/* <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <DoorOpen className="size-5" />
          </div> */}
          <CardTitle className="text-xl">Добро пожаловать</CardTitle>
          <CardDescription>
            Войдите в свой аккаунт или создайте новый, чтобы продолжить
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-2">
          <Button asChild>
            <Link to="/login">Войти</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/register">Создать аккаунт</Link>
          </Button>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-center text-xs text-muted-foreground">
            Продолжая, вы соглашаетесь с условиями использования
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Home