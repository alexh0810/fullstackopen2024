import { useMutation } from '@apollo/client';
import { useState, useEffect } from 'react';
import { LOGIN } from '../queries';
const Login = (props) => {
  const { setToken, show, setPage } = props;
  console.log('🚀 ~ Login ~ setToken:', setToken);
  if (!show) {
    return null;
  }

  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      console.log('Not authenticated!');
    },
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      localStorage.setItem('user', token);
      setToken(token);
    }
  }, [result.data, setToken]);

  const submit = async (e) => {
    e.preventDefault();
    login({ variables: { username, password } });
  };
  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username
          <input
            value={username}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div>
          password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default Login;
