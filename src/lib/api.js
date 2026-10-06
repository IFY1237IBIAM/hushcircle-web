import axios from "axios";
import Cookies from "js-cookie";

const API_URL    = "https://wecare-backend-anxl.onrender.com/api";
const TOKEN_KEY  = "hush_token";

const api = axios.create({ baseURL: API_URL, timeout: 30000 });

api.interceptors.request.use(config => {
  const token = Cookies.get(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && err.response?.data?.message === "Not authorized, token failed") {
      Cookies.remove(TOKEN_KEY);
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export function setToken(t)  { Cookies.set(TOKEN_KEY, t, { expires: 7, secure: true, sameSite: "strict" }); }
export function getToken()   { return Cookies.get(TOKEN_KEY); }
export function clearToken() { Cookies.remove(TOKEN_KEY); }
export default api;
