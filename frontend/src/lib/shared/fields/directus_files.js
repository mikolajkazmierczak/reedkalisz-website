export const search = ['id', 'title', 'type', 'filesize', 'filename_download', 'width', 'height'];
export const show = [...search];

export const read = [...show, 'uploaded_on', 'modified_on', 'uploaded_by', 'modified_by'];
export const edit = [...read, 'filename_disk'];

export default { search, show, read, edit };
