import { LoginForm } from "@components/LoginForm"
import classes from './styles.modules.scss'

export const LoginPage = () => {
    return <div className={classes.container}>
        <LoginForm />
    </div>
}