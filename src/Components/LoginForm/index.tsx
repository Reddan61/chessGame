import { clsx } from "clsx";
import { ChangeEvent, FormEvent, useState } from "react";
import { LoginValues, useAuth } from "@hooks/useAuth";
import classes from "./styles.modules.scss";
import { useNavigate } from "react-router-dom";

const MIN_USERNAME_LENGTH = 1;

export const LoginForm = () => {
  const navigate = useNavigate();
  const { handleLogin } = useAuth();

  const [values, setValues] = useState<LoginValues>({
    username: "",
  });

  const [errors, setErrors] = useState<(keyof LoginValues)[]>([]);

  const hasErrors = (name: keyof typeof values) => {
    return errors.includes(name);
  };

  const validate = () => {
    const { username } = values;
    const newErrors = [] as typeof errors;

    if (username.length < MIN_USERNAME_LENGTH) {
      newErrors.push("username");
    }

    setErrors(newErrors);

    if (newErrors.length > 0) return true;

    return false;
  };

  const changeField =
    (name: keyof typeof values) => (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;

      setValues((state) => ({ ...state, [name]: value }));
    };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isError = validate();

    if (isError) return;

    handleLogin(values);

    navigate("/");
  };

  return (
    <form onSubmit={submit} className={classes.form}>
      <div className={classes.field}>
        <span>Username</span>
        <input
          type="text"
          value={values["username"]}
          onChange={changeField("username")}
          className={clsx(classes.input, {
            [classes.input_error]: hasErrors("username"),
          })}
        />
      </div>

      <button type="submit" className={classes.submit}>
        Sign in
      </button>
    </form>
  );
};
