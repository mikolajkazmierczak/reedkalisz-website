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
  const date = new Date().toISOString().slice(0, -5); // slice removes ms (.000Z)
  // add one hour (and adjust for next day)
  const [datePart, timePart] = date.split('T');
  const [hours, minutes, seconds] = timePart.split(':');
  const newHours = (parseInt(hours) + 1) % 24;
  const newDate = newHours == 0 ? new Date(datePart).addDays(1).toISOString().slice(0, 10) : datePart;
  return `${newDate}T${newHours}:${minutes}:${seconds}`;
}

export default parseDatetime;
