import { Api } from "../base.js";
import { fetchApi } from "./EasyGifts.js";

export class Macma extends Api {
  fetch = async ({ company }) => fetchApi(company, "macma.pl");
}
