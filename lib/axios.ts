import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { deleteAllCookies, getCookie } from '../utils/cookie';

const authRequestInterceptor = (config: AxiosRequestConfig) => {
  const token = getCookie('userToken');
  console.log('get token ==== : ', document.cookie);

  let headers: any = {};
  if (token != null) {
    headers.authorization = `Bearer ${token}`;
  }

  return { ...config, headers };
};

const onFulfilled = (response: AxiosResponse<any, any>) => {
  return response;
};

const onRejected = async (error: any) => {
  if (error?.response?.status === 401) {
    deleteAllCookies();
    window.location.href = `/login`;
  }
  const errorConfig = error.config;
};

axios.interceptors.request.use(authRequestInterceptor);

axios.interceptors.response.use(onFulfilled, onRejected);

export const api = axios;
