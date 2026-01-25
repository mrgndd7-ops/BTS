import { redirect } from 'next/navigation'

export default function HomePage() {
  // Kullanıcı giriş yapmışsa dashboard'a, değilse login'e yönlendir
  redirect('/login')
}
