import cookie from 'js-cookie';
import { GetServerSidePropsContext } from 'next/types';

export const setCookie = (key: string, value: string, expires?: number) => {
  if (typeof window !== 'undefined') {
    const options = expires ? { expires, path: '/' } : { path: '/' };
    cookie.set(key, value, options);
  }
};

export const deleteAllCookies = () => {
  if (typeof window !== 'undefined') {
    Object.keys(cookie.get()).forEach((name) => {
      console.log('remove : ', name);
      cookie.remove(name);
    });
  }
};

export const removeCookie = (key: string) => {
  if (typeof window !== 'undefined') {
    cookie.remove(key);
  }
};

export const getCookie = (key: string) => {
  return cookie.get(key);
};

export const getCookieFromServer = (
  key: string,
  ctx: GetServerSidePropsContext
) => {
  return ctx.req.cookies[key];
};
