import axios, { AxiosInstance } from "axios";

export interface ICalendlyClient extends CalendlyClient {}

class CalendlyClient {
  constructor(private httpClient: AxiosInstance) {}

  async get(path: string, params?: object) {
    const { data } = await this.httpClient.get(path, {
      params,
    });

    return data;
  }

  async post(path: string, payload: object) {
    const { data } = await this.httpClient.post(path, payload);

    return data;
  }

  async delete(path: string) {
    return this.httpClient.delete(path);
  }
}

export const createCalendlyClient = (config: { token: string }) => {
  const { token } = config;

  const httpClient = axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
    },
    baseURL: "https://api.calendly.com",
  });

  return new CalendlyClient(httpClient);
};
