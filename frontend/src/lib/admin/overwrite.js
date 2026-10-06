import { deep } from '%/utils';
import { editedElsewhere } from '@/dialog';

// Someone else's save over what a page has open. The page knows the version it loaded (a "stamp": `date_updated`, or
// the saved value itself where other writes bump `date_updated` too); another one turning up means:
// - heard of (heimdall, or the shared data read again after the connection came back): nothing unsaved here - theirs
//   is loaded quietly; unsaved edits - the "edited elsewhere" dialog
// - read just before saving: the dialog, and no save. Odśwież loads theirs, Rozumiem keeps these edits - and the next
//   save goes through over that version (a newer one asks again); dropping the edits loads it
// `loaded()` gives the page's version, `unsaved()` whether it has edits, `reload(stamp)` loads the saved version.
export function overwriteGuard({ loaded, unsaved, reload }) {
  let accepted; // the version the admin chose to save over
  let asking = null; // the open dialog and what follows it: one at a time, acted on once
  let latest; // the newest version seen while it's open

  const known = (stamp) => deep.same(stamp, loaded()) || deep.same(stamp, accepted);

  function decide(stamp) {
    latest = stamp;
    asking ??= editedElsewhere().then((refresh) => {
      asking = null;
      if (!refresh) return void (accepted = latest);
      accepted = undefined;
      return reload(latest);
    });
    return asking;
  }

  return {
    // another version was heard of
    async seen(stamp) {
      if (!unsaved()) {
        if (deep.same(stamp, loaded())) return;
        accepted = undefined;
        return reload(stamp);
      }
      if (!known(stamp)) await decide(stamp);
    },
    // just before saving, with the version saved now: false stops the save
    async check(current) {
      if (known(current)) return true;
      await decide(current);
      return false;
    },
    // the edits were dropped (Anuluj, confirmed - the only time it's called): the version accepted to save over is
    // loaded now (not waiting for the page's `unsaved`: an editor's comes from an async diff, later)
    async dropped() {
      if (accepted === undefined) return;
      const stamp = accepted;
      accepted = undefined;
      await reload(stamp);
    },
    // saved, or loaded again: what was accepted is no longer anything
    reset() {
      accepted = undefined;
    },
  };
}
