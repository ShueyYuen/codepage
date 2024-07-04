import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://api.shuey.fun/api',
});

export default instance;
