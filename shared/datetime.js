export function parseDatetime(datetime, seconds = false) {
  // there are two types of dates in directus: datetime and timestamp
  // datatime: YYYY-MM-DDThh:mm:ss
  // timestamp: YYYY-MM-DDThh:mm:ss.zzzz (with milliseconds)

  let date = null;
  let time = null;
  if (!datetime) return { date, time, str: () => null };

  try {
    const splt = datetime.split('T');
    date = splt[0].replaceAll('-', '.');
    date = date.split('.').reverse().join('.'); // DD.MM.YYYY
    time = splt[1].split('.')[0]; // remove milliseconds if timestamp
    if (!seconds) time = time.split(':').slice(0, 2).join(':'); // remove seconds
    return { date, time, str: () => `${date} ${time}` };
  } catch (err) {
    console.log('datetime error (wrong format?): ' + datetime);
    console.error(err);
  }
}

export function getISODate() {
  // returns date (now) in format: yyyy-mm-ddThh:mm:ss
  const padZero = num => num.toString().padStart(2, '0');
  const datetime = new Date();
  const yyyy = datetime.getFullYear();
  const mm = padZero(datetime.getMonth() + 1);
  const dd = padZero(datetime.getDate());
  const hh = padZero(datetime.getHours());
  const mi = padZero(datetime.getMinutes());
  const ss = padZero(datetime.getSeconds());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
}

export default parseDatetime;
