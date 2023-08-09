export interface LoginValues {
  username: string;
}

const LOCALSTORAGE_KEY = 'user'

export const useAuth = () => {
  const checkAuth = () => {
    const value = localStorage.getItem(LOCALSTORAGE_KEY)

    if (!value) return false

    const parsed = JSON.parse(value)

    return !!parsed?.values.username?.length
  };

  const handleLogin = (values: LoginValues) => {
    const payload = JSON.stringify({
      values,
    });

    localStorage.setItem(LOCALSTORAGE_KEY, payload);
  };

  const handleLogout = () => {
    localStorage.removeItem(LOCALSTORAGE_KEY);
  };

  return {
    handleLogin,
    handleLogout,
    checkAuth,
  };
};
