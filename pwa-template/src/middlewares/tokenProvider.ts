export const createTokenProvider = () => {
  let _token: string | null = null;
  let observers: Array<(isLogged: boolean) => void> = [];

  const initializeToken = () => {
    const tokenString = localStorage.getItem("REACT_TOKEN_AUTH");
    _token = tokenString ? JSON.parse(tokenString) : null;
  };

  const subscribe = (observer: (isLogged: boolean) => void) => {
    observers.push(observer);
  };

  const unsubscribe = (observer: (isLogged: boolean) => void) => {
    observers = observers.filter((_observer) => _observer !== observer);
  };

  const isLoggedIn = () => {
    return !!_token;
  };

  const notify = () => {
    const isLogged = isLoggedIn();
    observers.forEach((observer) => observer(isLogged));
  };

  const setToken = (access_token: string | null) => {
    if (access_token) {
      localStorage.setItem("REACT_TOKEN_AUTH", JSON.stringify(access_token));
    } else {
      localStorage.removeItem("REACT_TOKEN_AUTH");
    }
    _token = access_token;
    notify();
  };

  const getToken = async () => {
    if (!_token) {
      initializeToken();
    }

    if (!_token) {
      return null;
    }

    return _token || null;
  };

  initializeToken();

  return {
    getToken,
    isLoggedIn,
    setToken,
    subscribe,
    unsubscribe,
  };
};
