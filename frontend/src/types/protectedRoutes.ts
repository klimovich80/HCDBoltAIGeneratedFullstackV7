import { ReactNode } from "react"
export type RequiredRole = 'admin' | 'trainer' | 'member' | 'guest'

export interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: RequiredRole
}