import axios from 'axios';

const request = axios.create({
  baseURL: 'http://localhost:3000', // API Gateway URL waiting for deployment
  timeout: 10000,
});

export default request;
