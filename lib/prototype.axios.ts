import Axios, {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
} from 'axios';
import config from 'config';
import { deleteAllCookies, getCookie, setCookie } from 'utils/cookie';
import { v4 as uuidv4 } from 'uuid';
import retryAxios from './retryAxios';

const withoutRefreshTokenUrl = ['/api/v1/pex-portal/userprofile/login'];

const authRequestInterceptor = (axiosConfig: AxiosRequestConfig) => {
  const accessToken = getCookie('accessToken');

  const headers: AxiosRequestHeaders = {
    'content-type':
      axiosConfig?.headers?.['content-type'] || 'application/json',
    requestuid: uuidv4(),
    'accept-language': 'en',
  };

  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`;
  }

  return {
    ...axiosConfig,
    headers,
  };
};

const frontendServiceApi = Axios.create({
  baseURL: config.frontendServiceEndpoint,
});
const mockServiceApi = Axios.create();

frontendServiceApi.interceptors.request.use(authRequestInterceptor);

const onFulfilled = (response: AxiosResponse<any, any>) => {
  return response.data;
};

const onRejected = async (error: any) => {
  const errorConfig = error.config;
  const refreshToken = getCookie('refreshToken');
  if (
    error?.response?.status === 401 &&
    !withoutRefreshTokenUrl.includes(errorConfig.url)
  ) {
    return Axios.post(
      '/api/v1/pex-portal/userprofile/refreshToken',
      {
        refreshToken: refreshToken,
        channel: config.channel,
      },
      {
        baseURL: errorConfig.baseURL,
        headers: {
          ...errorConfig.headers,
          requestuid: uuidv4(),
          authorization: undefined,
        },
      }
    )
      .then(async (response) => {
        if (response?.data?.data?.accessToken) {
          setCookie('accessToken', response.data.data.accessToken);
          setCookie('refreshToken', response.data.data.refreshToken);
          const retryResponse = await retryAxios(errorConfig.url, {
            ...errorConfig,
            baseURL: errorConfig.baseURL,
            headers: {
              ...errorConfig.headers,
              authorization: `Bearer ${response.data.data.accessToken}`,
              requestuid: uuidv4(),
            },
          });
          return retryResponse.data;
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        deleteAllCookies();
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;
        const encodeURI = encodeURIComponent(`${currentPath}${currentSearch}`);
        const returnUrl =
          currentPath && currentPath !== '/' ? `?returnUrl=${encodeURI}` : '';
        window.location.href = `/login${returnUrl}`;
      });
  } else {
    return Promise.reject(error);
  }
};

frontendServiceApi.interceptors.response.use(onFulfilled, onRejected);

mockServiceApi.interceptors.response.use(onFulfilled, onRejected);

const axios = {
  frontendServiceApi,
  api: mockServiceApi,
};

export default axios;
