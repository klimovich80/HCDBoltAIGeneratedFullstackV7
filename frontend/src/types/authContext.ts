import { ReactNode } from "react"
import { User } from "./user"

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

export interface AuthProviderProps {
  children: ReactNode
}
