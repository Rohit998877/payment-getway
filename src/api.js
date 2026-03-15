import axios from "axios";

const API = axios.create({
  baseURL: "https://payment-getway-app.onrender.com"
});

export default API;