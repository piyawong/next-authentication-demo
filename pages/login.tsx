import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import type { NextApiRequest, NextApiResponse } from 'next';
import { GetServerSidePropsContext } from 'next/types';
import { getCookieFromServer, setCookie, removeCookie } from '../utils/cookie';
import { api } from '../lib/axios';

type LoginProps = {
  isLoggedIn: boolean;
};

export default function Login(props: LoginProps) {
  const [isLogin, setIsLogin] = useState(props.isLoggedIn);
  const [form, setForm] = useState({ username: '', password: '' });

  useEffect(() => {
    console.log(form);
  }, [form]);

  const handleChangeForm = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { username, password } = form;
      const res = await api.post('http://localhost:3000/api/auth/login', {
        username,
        password,
      });
      setIsLogin(true);
      console.log('res = ', res.data);
      const { token } = res.data;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCookie('userToken', token);
      alert('success');
    } catch (error) {
      console.log('error : ', error);
      setIsLogin(false);
      const errors = error as Error | AxiosError;
      alert('Something went wrong');
      console.error(errors);
    }
  };

  const handleLogout = async () => {
    try {
      removeCookie('userToken');
      const res = await api.post('http://localhost:3000/api/auth/logout');
      setIsLogin(false);
    } catch (error) {
      alert(error);
    }
  };

  const handleCheck = async () => {
    try {
      const res = await axios.post('http://localhost:3000/api/auth/check');
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div>
      <h1>Login Page</h1>
      {isLogin ? (
        <div>
          <h2>
            Login Success Now u can access Home Page
            <Link href="/">Here</Link>
          </h2>

          <button
            style={{ marginTop: 10, width: '100%' }}
            onClick={handleLogout}
          >
            Logout
          </button>

          <button
            style={{ marginTop: 10, width: '100%' }}
            onClick={handleCheck}
          >
            Check
          </button>
        </div>
      ) : (
        <form
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '200px',
          }}
        >
          <div>
            username
            <input
              name="username"
              value={form.username}
              onChange={handleChangeForm}
            ></input>
          </div>
          <div>
            password
            <input
              name="password"
              value={form.password}
              onChange={handleChangeForm}
            ></input>
          </div>
          <button
            style={{ marginTop: 10, width: '100%' }}
            onClick={handleSubmitForm}
          >
            LOGIN
          </button>
        </form>
      )}
    </div>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  try {
    const token = getCookieFromServer('userToken', ctx);
    if (token) {
      return {
        props: {
          isLoggedIn: true,
        },
      };
    } else {
      return {
        props: {
          isLoggedIn: false,
        },
      };
    }
  } catch (error) {
    return {
      props: {
        isLoggedIn: false,
      },
    };
  }
}
