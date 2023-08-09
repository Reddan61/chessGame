import { useMemo } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@src/hooks/useAuth"

export const Protector = () => {
    const { checkAuth } = useAuth()

    const isAuth = useMemo(() => {
        return checkAuth()
    }, [])

    if (isAuth) return <Outlet />

    return <Navigate to={"/login"} /> 
}