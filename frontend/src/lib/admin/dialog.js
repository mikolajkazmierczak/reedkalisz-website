import { beforeNavigate, goto } from '$app/navigation';
import { writable } from 'svelte/store';

// The admin's own alert and confirm (shown by Dialog.svelte, in the admin layout), one at a time.
//   await ask('Usunąć produkt?', { danger: true, ok: 'Usuń' }) -> true or false
//   await tell('Nie można usunąć kategorii...')
export const dialogs = writable([]); // [{ title, message, ok, cancel, danger, icon, resolve }]

function open(dialog) {
  return new Promise((resolve) => dialogs.update((list) => [...list, { ...dialog, resolve }]));
}

// `icon`: the yes button's, in place of the tick (or the bin)
export const ask = (message, { title = null, ok = 'OK', cancel = 'Anuluj', danger = false, icon = null } = {}) =>
  open({ title, message, ok, cancel, danger, icon });

export const tell = (message, { title = null, ok = 'OK', danger = false } = {}) =>
  open({ title, message, ok, cancel: null, danger });

// someone else saved what's open here (see overwrite.js): true to load theirs - asked twice, it drops the edits here -,
// false to keep these (Rozumiem, or Anuluj on the second question)
export async function editedElsewhere() {
  const refresh = await ask('Ktoś właśnie zapisał zmiany w tym elemencie.\nZapisując swoje, nadpiszesz je.', {
    title: 'Uwaga!',
    cancel: 'Rozumiem',
    ok: 'Odśwież',
    icon: 'refresh',
  });
  return (
    refresh &&
    (await ask('Stracisz swoje zmiany.', { title: 'Na pewno?', ok: 'Odśwież', danger: true, icon: 'refresh' }))
  );
}

const UNSAVED = 'Zmiany nie zostały zapisane. Czy na pewno chcesz opuścić stronę?';
export const askLeaving = (message = UNSAVED) => ask(message, { ok: 'Opuść', cancel: 'Zostań', danger: true });

// Leaving a page with unsaved changes asks first. `isUnsaved` (and `message`, when it's a function) is read when
// leaving; `discard` runs when the admin leaves anyway. Closing the tab or reloading gets the browser's own question (a page can't show its own there).
let passing = false; // the navigation an admin already agreed to
let asking = false; // one question, however many guards stop the navigation
export function guardLeaving(isUnsaved, { message = UNSAVED, discard = () => {} } = {}) {
  beforeNavigate((navigation) => {
    if (passing || !isUnsaved()) return;
    navigation.cancel();
    if (asking || navigation.type === 'leave' || !navigation.to) return;
    const to = navigation.to.url;
    // a Back (or Forward) SvelteKit has already undone: going there replaces this page's entry, or Back returns to it
    const back = navigation.type === 'popstate';
    asking = true;
    askLeaving(typeof message === 'function' ? message() : message).then(async (leave) => {
      asking = false;
      if (!leave) return;
      discard();
      passing = true;
      try {
        // from an editor back to its list, the list stays scrolled where it was
        const noScroll = location.pathname.startsWith(to.pathname + '/');
        if (to.origin === location.origin) await goto(to, { replaceState: back, noScroll });
        else location.href = to.href;
      } finally {
        passing = false;
      }
    });
  });
}
