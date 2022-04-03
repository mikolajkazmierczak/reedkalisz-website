export default function (datetime) {
  let date;
  let time;
  if (datetime) {
    const splt = datetime.split('T');
    date = splt[0].replaceAll('-', '.');
    time = splt[1];
    return `${date}&nbsp;|&nbsp;${time}`;
  }
}
