// Directus gives dates in two shapes:
// - dateTime: YYYY-MM-DDThh:mm:ss, the server's wall time, no zone (the server is in Warsaw)
// - timestamp: YYYY-MM-DDThh:mm:ss.sssZ, in UTC (questions, commercial details, files, a company's last scan...)
// both are shown as Warsaw's wall time: a timestamp taken as it is reads 1-2 hours early
const ZONE = 'Europe/Warsaw';
const zoned = /(Z|[+-]\d\d:?\d\d)$/;
const warsaw = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

// YYYY-MM-DDThh:mm:ss in Warsaw (a zoneless one is already)
function wallTime(datetime) {
  if (!zoned.test(datetime)) return datetime;
  const parts = Object.fromEntries(warsaw.formatToParts(new Date(datetime)).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

export function parseDatetime(datetime, seconds = false) {
  let date = null;
  let time = null;
  if (!datetime) return { date, time, str: () => null };

  try {
    const splt = wallTime(datetime).split('T');
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
  // returns date (now) in UTC: yyyy-mm-ddThh:mm:ss.sssZ - a zoneless one would be read in whatever zone
  // Directus runs in, not heimdall's
  return new Date().toISOString();
}

export default parseDatetime;
