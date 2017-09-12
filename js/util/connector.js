import axios from 'axios';
import {url} from './const';

export const timeout = 8000;

export const client = axios.create({
  baseURL: 'http://' + url,
  timeout: timeout
});

client.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  console.warn("ERROR:"+JSON.stringify(error));
  var response = error.response;
  if (response) {
    if ((response.status >= 400) && (response.status <= 500)) {
      error = ':'+error.response.status;
    }
  }
  return Promise.reject(error);
});
