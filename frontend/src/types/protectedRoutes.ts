import { ReactNode } from "react"

export interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'admin' | 'trainer' | 'member' | 'guest'
}