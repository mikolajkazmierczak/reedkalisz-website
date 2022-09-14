export const search = [];
export const show = [];

export const read = ['id', 'title', 'type', 'filesize'];
export const edit = [
  ...read,
  'uploaded_by',
  'uploaded_on',
  'modified_by',
  'modified_on',
  'filename_disk',
  'filename_download',
  'width',
  'height'
];

export default { search, show, read, edit };
