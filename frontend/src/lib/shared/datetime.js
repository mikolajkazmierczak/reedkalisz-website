export function getDatetime(datetime, seconds = false) {
  // there are two types of dates in directus: datetime and timestamp
  // datatime: YYYY-MM-DDThh:mm:ss
  // timestamp: YYYY-MM-DDThh:mm:ss.zzzz (with milliseconds)
  let date;
  let time;
  if (datetime) {
    const splt = datetime.split('T');
    date = splt[0].replaceAll('-', '.');
    date = date.split('.').reverse().join('.'); // DD.MM.YYYY
    time = splt[1].split('.')[0]; // remove milliseconds if timestamp
    if (!seconds) time = time.split(':').slice(0, 2).join(':'); // remove seconds
    if (time.split)
      return {
        date,
        time,
        str: () => `${date} ${time}`
      };
  }
}

export default getDatetime;
