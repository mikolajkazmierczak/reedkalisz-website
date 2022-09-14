import fetch from 'node-fetch';

const { API } = process.env;

export async function read(token, endpoint, body = null) {
  let options = {
    method: 'get',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  };
  if (body) options.body = body;
  const res = await fetch(API + endpoint, options);
  const json = await res.json();
  return json.data;
}
