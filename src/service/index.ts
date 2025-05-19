import axios from "axios";

const baseURL = "http://localhost:9000/api/v1";

const instance = axios.create({
  baseURL,
});

export { instance };
