// Moving around a table of fields as in a spreadsheet (as reed-system's tables do). A field reached is selected whole:
// the arrows go to the nearest field that way, Tab along the row (into the next one at its end), Enter starts editing
// it - as F2 or a click on it again do, and as typing does, the value then replaced. Edited, the field keeps its own
// keys but these: Enter commits and goes down, Tab along, the up and down arrows up or down, Escape puts back what was
// there. A cell is a <td> or <th> holding a field; rows and columns are the table's own (its head's amounts included).
// Past the last field of a row the right arrow lands on the button of the cell marked `data-grid-end` (adding a
// column), the left arrow from there back on the field it came from.
export function gridKeys(table) {
  let editing = null; // the field being edited
  let reached = null; // the field `before` is of
  let before = ''; // what was in it when it was reached
  let cameFrom = null; // the field the end's button was reached from

  const fieldIn = (cell) => cell?.querySelector('input:not([type=checkbox]):not(:disabled)') ?? null;
  const placeOf = (input) => {
    const cell = input.closest('td, th');
    return [cell.parentElement.rowIndex, cell.cellIndex];
  };

  // reached: selected whole, nothing to be typed over by accident
  function land(input) {
    editing = null;
    reached = input; // (before focus(): focusin leaves it be)
    before = input.value;
    input.focus();
    input.select();
    return true;
  }

  // to the nearest field `rows` down or `columns` along (wrapping into the next row with `wrap`), skipping cells
  // without one (the head's names, the buttons)
  function move(input, rows, columns, wrap = false) {
    let [row, column] = placeOf(input);
    for (;;) {
      if (rows) row += rows;
      else {
        column += columns;
        if (column < 0 || column >= (table.rows[row]?.cells.length ?? 0)) {
          if (!wrap) return false;
          row += columns;
          column = columns > 0 ? 0 : (table.rows[row]?.cells.length ?? 0) - 1;
        }
      }
      if (row < 0 || row >= table.rows.length) return false;
      const next = fieldIn(table.rows[row].cells[column]);
      if (next) return land(next);
    }
  }

  // past a row's last field: the end's button, if there is one
  function toEnd(input) {
    const end = table.querySelector('[data-grid-end] button:not(:disabled)');
    if (!end) return false;
    cameFrom = input;
    editing = null;
    end.focus();
    return true;
  }

  // the caret at the end of the value: a number field refuses setSelectionRange, but a value set again moves it there
  function edit(input) {
    editing = input;
    const value = input.value;
    try {
      input.setSelectionRange(value.length, value.length);
    } catch {
      input.value = '';
      input.value = value;
    }
  }

  function keydown(e) {
    const input = e.target;
    if (e.key === 'ArrowLeft' && input.closest?.('[data-grid-end]')) {
      e.preventDefault();
      if (cameFrom?.isConnected) land(cameFrom);
      return;
    }
    if (!(input instanceof HTMLInputElement) || !fieldIn(input.closest('td, th'))) return;
    const own = () => {
      e.preventDefault();
      e.stopPropagation();
    };
    const back = e.shiftKey ? -1 : 1;
    if (editing === input) {
      if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        own();
        const moved =
          e.key === 'Tab'
            ? move(input, 0, back, true)
            : move(input, e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : back, 0);
        if (!moved) land(input);
      } else if (e.key === 'Escape') {
        own();
        input.value = before;
        input.dispatchEvent(new Event('input', { bubbles: true })); // (what's bound to it follows)
        land(input);
      }
      return;
    }
    const moves = {
      ArrowDown: () => move(input, 1, 0),
      ArrowUp: () => move(input, -1, 0),
      ArrowRight: () => move(input, 0, 1) || toEnd(input),
      ArrowLeft: () => move(input, 0, -1),
      Tab: () => move(input, 0, back, true),
      Enter: () => edit(input),
      F2: () => edit(input),
    };
    if (moves[e.key]) {
      own();
      moves[e.key]();
    } else if ((e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') && !e.ctrlKey && !e.metaKey) {
      editing = input; // (typed over the selected value)
    }
  }

  // a click reaches a field as the keys do; a click on the field already reached edits it, the caret where it lands
  function pointerdown(e) {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || e.button !== 0 || !fieldIn(input.closest('td, th'))) return;
    if (document.activeElement === input) editing = input;
    else {
      e.preventDefault();
      land(input);
    }
  }
  // reached another way (Tab into the table, Shift+Tab back into it): what Escape puts back is its own value (a field
  // focused again after its row or column moved is still `reached`, its value from before the edit kept)
  function focusin(e) {
    const input = e.target;
    if (input === reached || !(input instanceof HTMLInputElement) || fieldIn(input.closest('td, th')) !== input) return;
    editing = null;
    reached = input;
    before = input.value;
  }
  const focusout = (e) => e.target === editing && (editing = null);

  table.addEventListener('keydown', keydown, true);
  table.addEventListener('pointerdown', pointerdown);
  table.addEventListener('focusin', focusin);
  table.addEventListener('focusout', focusout);
  return {
    destroy() {
      table.removeEventListener('keydown', keydown, true);
      table.removeEventListener('pointerdown', pointerdown);
      table.removeEventListener('focusin', focusin);
      table.removeEventListener('focusout', focusout);
    },
  };
}
