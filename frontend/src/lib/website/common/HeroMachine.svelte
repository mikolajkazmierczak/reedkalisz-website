<script>
  // The workshop as a shop drawing, like the section icons (see SectionIcon): line work on the navy, every part filled
  // so whatever stands behind it is hidden, and one orange part per station - the space for the client's logo, in
  // the orange of the hero's "z Twoim logo" (REED's own plate on the printer's door stays its red).
  //
  // Left to right: a printer of self-copying forms, a page at a time out between two rolls, cut off by a knife into a
  // box on the floor; a printer taking paper in at the top and putting it out, printed, in a tray; then along one
  // belt a stamp press over a business card, an engraver over a mug (its rotator beside it), a laser over a pen - the
  // card and pen fed from faint dispensers behind, the mugs waiting in a row behind theirs - and a chute into boxes,
  // printed shirts hanging over them and a three-fold calendar on the wall behind. Business cards, paper, rolled-up
  // roll-ups and two desk calendars wait on the brace under the belt.
  //
  // It runs (unless motion is reduced, and only while it's on screen): each station works on its blank, which gets its
  // mark then, and the belt carries the three down the chute into the box; new blanks come out of the dispensers, the
  // next mug slides in. The printers work in runs, then rest. The timings are below, in seconds; the keyframes are
  // written from them, and the time is set from here, 60 frames a second at most.
  //
  // Coordinates are the viewBox's (716 x 422 from y 30, down to the floor, y 452; its hatching shows past it): the
  // belt's top is y 296. It's drawn as big as fits the box it's given, at its right and foot. Parts are drawn back to
  // front: the wall, the dispensers and the columns behind the belt, the bench and the belt, then each station over
  // it, what's on the belt, and the boxes in front of all.
  import { onMount } from 'svelte';

  const range = (from, to, step) =>
    Array.from({ length: Math.floor((to - from) / step + 1e-9) + 1 }, (_, i) => from + i * step);
  const deg = Math.PI / 180;

  // the stamp press's return spring, round its ram (x 286)
  const spring =
    'M286 152' +
    range(156, 196, 4)
      .map((y, i) => `L${i % 2 ? 297 : 275} ${y}`)
      .join('') +
    'L286 200';

  // its lever's swing, an arrow along it (round the pivot over the ram, outside the knob)
  function swing(cx, cy, r, from, to) {
    const at = (a) => [cx + r * Math.cos(a * deg), cy + r * Math.sin(a * deg)].map((v) => +v.toFixed(1));
    const head = (a, back) => {
      const [x, y] = at(a);
      const tip = (b) => `${+(x + 4 * Math.cos(b * deg)).toFixed(1)} ${+(y + 4 * Math.sin(b * deg)).toFixed(1)}`;
      return `M${tip(back + 35)}L${x} ${y}L${tip(back - 35)}`;
    };
    return `M${at(from).join(' ')}A${r} ${r} 0 0 0 ${at(to).join(' ')}` + head(from, from - 90) + head(to, to + 90);
  }
  const lever = swing(286, 114, 72, -116, -146);

  // rolled-up roll-up banners in a pile on the brace, seen end on: three side by side, touching, one in the groove on
  // the left two (its centre r·√3 above theirs); the first mostly behind the middle leg, its edge showing left of it
  const R = 10;
  const rolls = [
    [391, 404],
    [411, 404],
    [431, 404],
    [401, 404 - R * Math.sqrt(3)],
  ];
  const coil = (cx, cy) =>
    'M' +
    range(0, 40, 1)
      .map(
        (i) =>
          `${(cx + (2.5 + i * 0.17) * Math.cos(i * 0.4)).toFixed(1)} ${(cy + (2.5 + i * 0.17) * Math.sin(i * 0.4)).toFixed(1)}`,
      )
      .join('L');

  // a T-shirt hanging from its collar at (cx, top): at K, 87 wide and 75 long, a shirt's size next to the 56-long pen
  const K = 1.5;
  const SHIRT = [
    [18, 2],
    [29, 12],
    [23, 18],
    [17, 13],
    [17, 50],
    [-17, 50],
    [-17, 13],
    [-23, 18],
    [-29, 12],
    [-18, 2],
  ];
  const shirt = (cx, top) =>
    `M${cx - 8 * K} ${top}Q${cx} ${top + 6 * K} ${cx + 8 * K} ${top}` +
    SHIRT.map(([x, y]) => `L${cx + x * K} ${top + y * K}`).join('') +
    'Z';

  // The forms: pages of 50 x 44, joined by a perforation, coming out of the rolls' nip (y 282) a page at a time; the
  // knife cuts at y 308, where a page's top perforation stops. The feed holds the page coming out and the one in the
  // rolls behind it; the page cut off falls from where it hung. The rolls' stripes, 5.5 apart, a page's run past
  // them, so a page fed moves them by whole stripes: the upper roll's face turning up, the lower's down.
  const NIP = 282;
  const CUT = 308;
  const PAGE = 44;
  const feed = [CUT - PAGE, CUT - 2 * PAGE];
  const stripes = { up: range(262, 282 + PAGE, 5.5), down: range(282 - PAGE, 302, 5.5) };

  // the printer's hopper: the front sheet, and three behind it, each up and right of the one before (the last one
  // only seen as the front one goes in), faint the further back
  const HOPPER = [
    { x: 171, y: 89, from: 0, to: 0.25 },
    { x: 168, y: 92, from: 0.25, to: 0.5 },
    { x: 165, y: 95, from: 0.5, to: 1 },
  ];

  // the mugs waiting behind the engraver's, in a row going back towards its post, each up and right of the one before
  // and fainter (the last only seen as the next one slides in)
  const QUEUE = [
    { dx: 54, dy: -9, from: 0, to: 0.25 },
    { dx: 36, dy: -6, from: 0.25, to: 0.5 },
    { dx: 18, dy: -3, from: 0.5, to: 1 },
  ];

  // the desk calendars' sides, sloping (a trapezoid, 454 to 494 at its top y 384, 450 to 498 at 414)
  const deskL = (y) => 454 - ((y - 384) * 4) / 30;
  const deskR = (y) => 494 + ((y - 384) * 4) / 30;

  // The belt's cycle, in seconds: the stamp, the engraver and the rotator come down, the stamp goes back up, the mug
  // turns (once round, its handle back where it was) and the engraver and the rotator go up, the laser fires
  // meanwhile; then the belt runs a stretch of 308 (22 ticks), each thing on it going off its end (x 582), down the
  // chute (its foot at 624, 324, tilted as it is, 34°) and into the box (640, 380, out of sight); new blanks come out
  // of the dispensers.
  const BELT = {
    cycle: 5.6,
    down: [0.15, 0.4],
    stamped: 0.55,
    up: 0.95,
    spin: [0.4, 1.45],
    turns: 1,
    lifted: 1.7,
    fire: [0.2, 1.55],
    run: [1.8, 4.08],
    by: 308,
    chute: 0.3,
    drop: 0.15,
    refill: [4.5, 5.1],
  };
  const END = 582;
  const FOOT = [624, 324];
  const TILT = 34;
  const BOX = [640, 380];
  const ITEMS = { card: 286, mug: 386, pen: 511 }; // each one's middle
  const ticks = range(270 - BELT.by, 566, 14);
  // The printer: ten sheets one after another, each into the hopper and out of the slot into the tray, shaking
  // while it prints; then a rest.
  const PRINT = { cycle: 6.4, sheets: 10, every: 0.36, sink: 0.18, out: [0.1, 0.32] };
  // The forms printer: six pages one after another, each fed out of the rolls, held while the knife crosses it, and
  // cut off to fall into the box; then a rest.
  const FORMS = { cycle: 17.4, pages: 6, every: 2.4, feed: 1.8, knife: [1.85, 2.1, 2.35], cut: 2.15, fall: [0.1, 0.5] };

  // Keyframes from moments in a cycle: [[a moment or a list of them, css], ...]; a jump is a step, at once.
  const IN = 'animation-timing-function:ease-in';
  const OUT = 'animation-timing-function:ease-out';
  const INOUT = 'animation-timing-function:ease-in-out';
  const STEP = 'animation-timing-function:steps(1,end)';
  function frames(name, cycle, list) {
    const at = (s) => (s <= 0 ? '0%' : s >= cycle ? '100%' : `${+((s / cycle) * 100).toFixed(3)}%`);
    return `@keyframes ${name}{${list.map(([t, css]) => `${[t].flat().map(at).join(',')}{${css}}`).join('')}}`;
  }

  function belt() {
    const { cycle: c, down, stamped, up, spin, turns, lifted, fire, run, by, chute, drop, refill } = BELT;
    const tool = (name, moved) =>
      frames(name, c, [
        [[0, down[0]], `transform:none;${IN}`],
        [[down[1], stamped], `transform:${moved};${OUT}`],
        [[up, c], 'transform:none'],
      ]);
    const lit = [[[0, fire[0] - 0.02], 'opacity:0']];
    for (let t = fire[0], i = 0; t <= fire[1]; t += 0.18, i++) lit.push([t, `opacity:${i % 2 ? 0.55 : 1}`]);
    lit.push([[fire[1] + 0.04, c], 'opacity:0']);
    const sparks = [];
    for (let t = 0, i = 0; t <= c; t += 0.18, i++) sparks.push([t, `opacity:${i % 2 ? 0.2 : 1}`]);
    // the mug's turn, sampled every 15°, held until it's gone into the box: its handle, a flat loop, seen at an angle a
    // round the axis (90° facing us) is its drawing squeezed to cos a, in front of the mug while it faces us; the mark is
    // at a + 90° (facing us as the turn ends), squeezed to its sin and 16·cos off the axis (the mug is 32 across), there
    // from half the turn, when its place goes past the engraver at the back - so it comes round to the front at the end
    const handle = [[0, 'transform:none']];
    const front = [[0, 'opacity:1']];
    const turned = [[0, 'opacity:0']];
    const steps = turns * 24;
    let last;
    for (let i = 0; i <= steps; i++) {
      const t = spin[0] + ((spin[1] - spin[0]) * i) / steps;
      const a = (turns * 360 * i) / steps;
      const face = a >= 180 ? Math.max(Math.sin((a + 90) * deg), 0) : 0;
      last = [
        `transform:scaleX(${+Math.cos(a * deg).toFixed(3)})`,
        `opacity:${i === 0 || Math.sin(a * deg) > 1e-6 ? 1 : 0}`,
        `transform:translateX(${+(16 * Math.cos((a + 90) * deg)).toFixed(2)}px) scaleX(${+face.toFixed(3)});opacity:${face > 1e-6 ? 1 : 0}`,
      ];
      handle.push([t, last[0]]);
      front.push([t, last[1]]);
      turned.push([t, last[2]]);
    }
    handle.push([refill[0] - 0.01, last[0]], [[refill[0], c], 'transform:none']);
    front.push([refill[0] - 0.01, last[1]], [[refill[0], c], 'opacity:1']);
    turned.push([refill[0] - 0.01, last[2]], [[refill[0], c], 'transform:none;opacity:0']);
    // each thing on the belt, at its pace
    const pace = by / (run[1] - run[0]);
    // (one coming out of a dispenser fades in; the mug, slid in by its queue, is there at once when it's arrived)
    const item = (name, x) => {
      const off = run[0] + (END - x) / pace;
      const box = off + chute + drop;
      const slid = name === 'hm-mug';
      return frames(name, c, [
        [[0, run[0]], 'transform:none;opacity:1'],
        [off, `transform:translate(${+(END - x).toFixed(2)}px,0);${IN}`],
        [off + chute, `transform:translate(${FOOT[0] - x}px,${FOOT[1] - 296}px) rotate(${TILT}deg);${IN}`],
        [box, `transform:translate(${BOX[0] - x}px,${BOX[1] - 296}px) rotate(${TILT}deg);opacity:1;${STEP}`],
        [[box + 0.01, slid ? refill[1] - 0.01 : refill[0]], `transform:none;opacity:0${slid ? `;${STEP}` : ''}`],
        [[refill[1], c], 'transform:none;opacity:1'],
      ]);
    };
    // the mugs' queue: each a place forward as the next one slides in, then (the mug there in its place) back,
    // the same as before
    const queue = frames('hm-queue', c, [
      [[0, refill[0]], `transform:none;opacity:var(--from);${INOUT}`],
      [refill[1] - 0.01, `transform:translate(-18px,3px);opacity:var(--to);${STEP}`],
      [[refill[1], c], 'transform:none;opacity:var(--from)'],
    ]);
    // a mark made at a moment (or over a stretch), gone once its thing is in the box
    const mark = (name, made) =>
      frames(name, c, [
        [[0, made[0]], 'opacity:0'],
        [[made[1], refill[0] - 0.01], 'opacity:1'],
        [[refill[0], c], 'opacity:0'],
      ]);
    return [
      tool('hm-stamp', 'translateY(36px)'),
      tool('hm-pull', 'rotate(-20deg)'),
      tool('hm-stretch', 'scaleY(1.75)'),
      frames('hm-lower', c, [
        [[0, down[0]], `transform:none;${INOUT}`],
        [[down[1], spin[1]], `transform:translateY(var(--down));${INOUT}`],
        [[lifted, c], 'transform:none'],
      ]),
      // the stamp's plate heating up, from 0.6s before the cycle starts, while it's still up; brightest as it lands,
      // gone by the time it's up again
      frames('hm-pressed', c, [
        [0, `opacity:${+(0.6 / (0.6 + down[1])).toFixed(3)}`],
        [[down[1], stamped], 'opacity:1'],
        [stamped + 0.06, 'opacity:0.6'],
        [stamped + 0.12, 'opacity:1'],
        [[up, c - 0.6], 'opacity:0'],
        [c, `opacity:${+(0.6 / (0.6 + down[1])).toFixed(3)}`],
      ]),
      frames('hm-wheel', c, [
        [[0, spin[0]], 'transform:none'],
        [[spin[1], c], 'transform:rotate(-1440deg)'],
      ]),
      frames('hm-handle', c, handle),
      frames('hm-handle-front', c, front),
      frames('hm-turned', c, turned),
      frames('hm-fire', c, lit),
      frames('hm-sparks', c, sparks),
      mark('hm-stamped', [down[1] - 0.01, down[1]]),
      mark('hm-engraved', fire),
      frames('hm-run', c, [
        [[0, run[0]], 'transform:none'],
        [[run[1], c], `transform:translateX(${by}px)`],
      ]),
      frames('hm-spin', c, [
        [[0, run[0]], 'transform:none'],
        [[run[1], c], 'transform:rotate(2520deg)'],
      ]),
      frames('hm-dispense', c, [
        [[0, refill[0]], `transform:none;${INOUT}`],
        [[refill[1] - 0.1, c], 'transform:translateY(var(--step))'],
      ]),
      ...Object.entries(ITEMS).map(([name, x]) => item(`hm-${name}`, x)),
      queue,
    ].join('');
  }

  function printing() {
    const { cycle: c, sheets, every, sink, out } = PRINT;
    const end = sheets * every;
    const take = [];
    const behind = [];
    const give = [[0, 'transform:translateY(-52px)']];
    const shake = [[0, 'transform:none']];
    for (let k = 0; k < sheets; k++) {
      const t = k * every;
      take.push([t, `transform:none;${IN}`], [t + sink, `transform:translateY(36px);${STEP}`]);
      behind.push([t, `transform:none;opacity:var(--from);${INOUT}`]);
      behind.push([t + sink, `transform:translate(-3px,3px);opacity:var(--to);${STEP}`]);
      give.push([t + out[0], `transform:translateY(-52px);${OUT}`], [t + out[1], `transform:none;${STEP}`]);
    }
    take.push([[end, c], 'transform:none']);
    behind.push([[end, c], 'transform:none;opacity:var(--from)']);
    give.push([c, 'transform:none']);
    for (let i = 1; i * 0.05 < end; i++) {
      shake.push([i * 0.05, `transform:translate(${i % 2 ? '0.45px,-0.25px' : '-0.45px,0.25px'})`]);
    }
    shake.push([[end + 0.05, c], 'transform:none']);
    return [
      frames('hm-take', c, take),
      frames('hm-behind', c, behind),
      frames('hm-give', c, give),
      frames('hm-shake', c, shake),
    ].join('');
  }

  function cutting() {
    const { cycle: c, pages, every, feed: fed, knife, cut, fall } = FORMS;
    const feeding = [];
    const cutter = [[0, 'transform:none']];
    const falling = [[0, 'transform:none;opacity:0']];
    for (let k = 0; k < pages; k++) {
      const t = k * every;
      feeding.push([t, `transform:none;${INOUT}`]);
      feeding.push([[t + fed, t + cut], `transform:translateY(var(--by));${STEP}`]);
      feeding.push([t + cut + 0.01, 'transform:none']);
      cutter.push([t + knife[0], `transform:none;${IN}`]);
      cutter.push([t + knife[1], `transform:translateX(-58px);${OUT}`]);
      cutter.push([t + knife[2], 'transform:none']);
      falling.push([t + cut, `transform:none;opacity:0;${STEP}`]);
      falling.push([[t + cut + 0.01, t + cut + fall[0]], `transform:none;opacity:1;${IN}`]);
      falling.push([t + cut + fall[1], `transform:translate(-2px,108px) rotate(-7deg);opacity:1;${STEP}`]);
      falling.push([t + cut + fall[1] + 0.01, 'transform:none;opacity:0']);
    }
    feeding.push([c, 'transform:none']);
    cutter.push([c, 'transform:none']);
    falling.push([c, 'transform:none;opacity:0']);
    return [frames('hm-feed', c, feeding), frames('hm-cut', c, cutter), frames('hm-fall', c, falling)].join('');
  }

  // (written into the page's head: the style below only gives them to the parts)
  const generated = `<style>${belt()}${printing()}${cutting()}</style>`;

  const bolts = [
    [18, 216], // forms printer
    [130, 168],
    [236, 168],
    [130, 432],
    [236, 432], // printer
    [260, 110],
    [336, 110], // stamp press head
    [364, 84],
    [426, 84], // engraver beam
    [454, 90],
    [572, 90], // laser crossbar
    [264, 316],
    [578, 316],
    [264, 350],
    [578, 350], // bench
  ];

  // Running only while it's on screen, and at 60 frames a second at most (left to itself the browser draws it at the
  // screen's rate, 120 or more on some): its animations paused, their time set here a frame at a time. Motion reduced,
  // there are none.
  let svg;
  function drive() {
    const animations = svg.getAnimations({ subtree: true });
    if (!animations.length) return null;
    for (const a of animations) a.pause();
    let time = animations[0].currentTime ?? 0; // (they ran from the start, before the page woke up)
    let last = null;
    let frame = null;
    const tick = (now) => {
      frame = requestAnimationFrame(tick);
      if (last !== null && now - last < 1000 / 60 - 1) return;
      if (last !== null) time += Math.min(now - last, 100); // (back after a gap: on, not a jump)
      last = now;
      for (const a of animations) a.currentTime = time;
    };
    const seen = new IntersectionObserver((entries) => {
      const { isIntersecting } = entries[entries.length - 1];
      if (isIntersecting && frame === null) {
        last = null;
        frame = requestAnimationFrame(tick);
      } else if (!isIntersecting && frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    });
    seen.observe(svg);
    return () => {
      seen.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }
  onMount(() => {
    // (set up again as the setting changes: motion reduced, its animations are cancelled - given a time again, they'd
    // run on; and back, they're new ones, at the screen's rate)
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let stop = drive();
    const change = () => {
      stop?.();
      stop = reduced.matches ? null : drive();
    };
    reduced.addEventListener('change', change);
    return () => {
      reduced.removeEventListener('change', change);
      stop?.();
    };
  });
</script>

<svelte:head>
  {@html generated}
</svelte:head>

<svg
  bind:this={svg}
  class="machine"
  style="--belt: {BELT.cycle}s; --print: {PRINT.cycle}s; --forms: {FORMS.cycle}s"
  viewBox="0 30 716 422"
  preserveAspectRatio="xMaxYMax meet"
  fill="none"
  stroke="currentColor"
  stroke-width="1.3"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true">
  <defs>
    <pattern id="hm-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <path d="M0 0V5" stroke-width="1" stroke-opacity="0.4" />
    </pattern>
    <!-- REED's packing tape: its red, the logo along it (a tape's top on a multiple of 9, so its logos sit in it) -->
    <pattern id="hm-tape" width="22" height="9" patternUnits="userSpaceOnUse">
      <rect width="22" height="9" fill="#c00418" stroke="none" />
      <image href="/logo.svg" x="3.4" y="1" width="15.2" height="7" />
    </pattern>
    <!-- the same down a box (turned: its strip from x 633.5 to 642.5, a little left of the big box's middle) -->
    <pattern
      id="hm-tape-down"
      width="22"
      height="9"
      patternUnits="userSpaceOnUse"
      patternTransform="translate(642.5 0) rotate(90)">
      <rect width="22" height="9" fill="#c00418" stroke="none" />
      <image href="/logo.svg" x="3.4" y="1" width="15.2" height="7" />
    </pattern>
    <!-- gone by the edges (r 0.5 of the box) -->
    <radialGradient id="hm-fade-g" cx="0.5" cy="0.55" r="0.5">
      <stop offset="0.4" stop-color="#fff" />
      <stop offset="0.95" stop-color="#fff" stop-opacity="0" />
    </radialGradient>
    <mask id="hm-fade" maskUnits="userSpaceOnUse" x="0" y="30" width="716" height="432">
      <rect y="30" width="716" height="432" fill="url(#hm-fade-g)" />
    </mask>
    <!-- what comes out of a slot or a nip shows only below it; what falls in a box, not under the floor; the rolls'
         stripes and the dispensers' stacks only in them -->
    <clipPath id="hm-tray"><rect x="126" y="254" width="114" height="70" /></clipPath>
    <clipPath id="hm-nip"><rect x="22" y={NIP} width="72" height="170" /></clipPath>
    <clipPath id="hm-floor"><rect x="0" y="30" width="120" height="422" /></clipPath>
    <clipPath id="hm-roll-up"><rect x="26" y="262" width="62" height="20" rx="9" /></clipPath>
    <clipPath id="hm-roll-down"><rect x="26" y="282" width="62" height="20" rx="9" /></clipPath>
    <clipPath id="hm-belt"><rect x="259" y="296" width="320" height="14" /></clipPath>
    <clipPath id="hm-cards"><rect x="264" y="264" width="44" height="26" /></clipPath>
    <clipPath id="hm-pens"><rect x="476" y="258" width="70" height="29" /></clipPath>
  </defs>

  <!-- the floor (the grid behind is the hero's, see the page) -->
  <path class="ground" d="M8 452H708" />
  <rect x="8" y="452" width="700" height="7" fill="url(#hm-hatch)" stroke="none" mask="url(#hm-fade)" />

  <!-- a three-fold calendar hanging on the wall behind the shirts, from a nail, a little faint: its header with the
       logo (the mark) and its lines, three months under it, today outlined -->
  <g class="wall">
    <path class="soft" d="M660 36L634 48M660 36L686 48" />
    <circle class="fill" cx="660" cy="36" r="1.6" />
    <rect class="b" x="630" y="48" width="60" height="176" rx="1" />
    <rect class="b" x="630" y="48" width="60" height="30" rx="1" />
    <rect class="mark" x="637" y="55" width="14" height="10" rx="1" />
    <path class="soft" d="M656 57H682M656 63H682M656 69H674" />
    {#each [82, 128, 174] as top}
      <rect class="b" x="635" y={top} width="50" height="42" />
      <path class="soft" d="M635 {top + 7}H685" />
      {#each range(top + 13, top + 37, 6) as y}
        <path class="soft" d="M638 {y}H682" />
      {/each}
      <path class="soft" d="M647 {top + 10}V{top + 39}M660 {top + 10}V{top + 39}M673 {top + 10}V{top + 39}" />
    {/each}
    <rect class="today" x="660" y="101" width="13" height="6" />
  </g>

  <!-- three printed shirts on hangers, overlapping on a rail mounted behind the gantry's right post (drawn before it, so
       the first shirt hangs partly behind it); the front one's print the mark -->
  <g>
    <!-- the rack's legs and feet, faint: it stands on the floor behind the belt and the boxes -->
    <path class="faint" d="M548 156V448M552 156V448M672 156V448M676 156V448" />
    <rect class="faint" x="538" y="448" width="24" height="4" rx="1" />
    <rect class="faint" x="662" y="448" width="24" height="4" rx="1" />
    <rect class="b" x="546" y="150" width="132" height="6" rx="3" />
    {#each [[592, false], [612, false], [632, true]] as [cx, printed]}
      <path d="M{cx} {168 - 4 * K}V156M{cx} 150a4 4 0 1 1 4 4" />
      <path class="b" d={shirt(cx, 168)} />
      <path d="M{cx - 24 * K} {168 + 4 * K}L{cx} {168 - 4 * K}L{cx + 24 * K} {168 + 4 * K}" />
      <path
        class="soft"
        d="M{cx - 6 * K} 168Q{cx} {168 + 9 * K} {cx + 6 * K} 168M{cx - 17 * K} {168 + 46 * K}H{cx + 17 * K}" />
      <rect class={printed ? 'mark' : 'soft'} x={cx - 8 * K} y={168 + 15 * K} width={16 * K} height={11 * K} rx="1.5" />
    {/each}
  </g>

  <!-- the dispensers, faint, behind the belt: each a housing with its blanks stacked in it, the lowest pushed out onto
       the belt as the next blank, the rest coming down a place (one more above than shows, so it's the same after);
       the mugs in a row behind theirs, after them -->
  <g class="ghost">
    <path d="M262 290V262H310V290" />
    <g clip-path="url(#hm-cards)">
      <g class="stack" style="--step: 5px">
        {#each range(251.6, 286.6, 5) as y}
          <rect x="266" {y} width="40" height="3.4" />
        {/each}
      </g>
    </g>
    <path d="M474 296V256H548V296" />
    <g clip-path="url(#hm-pens)">
      <g class="stack" style="--step: 10px">
        {#each [277, 267, 257, 247] as y}
          <path d="M489 {y + 2}L478 {y + 4.5}L489 {y + 7}" />
          <rect x="488" {y} width="56" height="9" rx="4.5" />
        {/each}
      </g>
    </g>
  </g>
  {#each QUEUE as { dx, dy, from, to }}
    <g transform="translate({dx} {dy})">
      <g class="queue" style="--from: {from}; --to: {to}; opacity: {from}">
        <path class="b" d="M402 266C414 266 416 286 402 288" />
        <path class="soft" d="M402 271C409 271 410 282 402 283" />
        <path class="b" d="M370 258H402V290Q402 296 396 296H376Q370 296 370 290Z" />
        <path class="soft" d="M370 263H402" />
      </g>
    </g>
  {/each}

  <!-- behind the belt: the columns the stations stand on -->
  <g>
    <rect class="b" x="320" y="120" width="16" height="190" />
    <rect class="b" x="416" y="92" width="14" height="218" />
    <rect class="b" x="343" y="246" width="16" height="64" />
    <rect class="b" x="452" y="98" width="12" height="212" />
    <rect class="b" x="562" y="98" width="12" height="212" />
  </g>

  <!-- the bench: legs, brace, what waits on it, the motor, the apron -->
  <g>
    <!-- the roll-ups, rolled (before the legs: the middle one stands in front of them) -->
    {#each rolls as [cx, cy]}
      <circle class="b" {cx} {cy} r={R} />
      <path class="soft" d={coil(cx, cy)} />
    {/each}

    <rect class="b" x="256" y="356" width="12" height="86" />
    <rect class="b" x="386" y="356" width="12" height="86" />
    <rect class="b" x="562" y="356" width="12" height="86" />
    <path class="soft" d="M268 414H386M268 420H386M398 414H562M398 420H562" />

    <!-- a stack of business cards, one stood in front leaning back on it, face out, its print the mark -->
    <rect class="b" x="276" y="392" width="38" height="22" />
    {#each range(395.5, 410.5, 3.5) as y}
      <path class="soft" d="M276 {y}H314" />
    {/each}
    <rect class="card" x="292" y="396" width="32" height="18" />
    <rect class="mark" x="296" y="400" width="9" height="4.5" rx="0.8" />
    <path class="soft" d="M296 407.5H314M296 411H319" />

    <!-- paper for the printer -->
    <rect class="b" x="331" y="408" width="50" height="6" />
    <rect class="b" x="328" y="402" width="50" height="6" />
    <rect class="b" x="332" y="396" width="50" height="6" />
    <path class="soft" d="M357 396V414" />

    <!-- two desk calendars standing beside them, one behind the other (fainter): the spiral's rings along the top, the
         month's grid under them -->
    {#each [-8, 0] as dx}
      <g class:far={dx} transform={dx ? `translate(${dx} 0)` : null}>
        <path class="b" d="M450 414L454 384H494L498 414Z" />
        {#each range(391, 409, 6) as y}
          <path class="soft" d="M{deskL(y) + 4} {y}H{deskR(y) - 4}" />
        {/each}
        <path class="soft" d="M464.5 391V411M474 391V411M483.5 391V411" />
        {#each range(458, 490, 6.4) as x}
          <circle class="b" cx={x} cy="384" r="2.4" />
        {/each}
      </g>
    {/each}

    <!-- the belt's motor, hung under the bench, its drive belt going up behind the apron to the end roller -->
    <path d="M559.7 383.8L585.7 305.1M548.3 380.2L572.3 300.9" />
    <rect class="soft" x="512" y="356" width="20" height="10" />
    <rect class="b" x="502" y="366" width="40" height="32" rx="3" />
    <path class="soft" d="M509 370V394M515 370V394M521 370V394M527 370V394M533 370V394" />
    <rect class="b" x="542" y="373" width="6" height="18" rx="1" />
    <circle class="b" cx="554" cy="382" r="6" />
    <path class="soft spin" d="M554 377V387" />
    <circle class="fill" cx="554" cy="382" r="1.6" />

    {#each [262, 392, 568] as x}
      <path class="p" d="M{x - 10} 440h20l3 12h-26z" />
      <path d="M{x - 10} 440h20l3 12h-26z" fill="url(#hm-hatch)" stroke="none" />
    {/each}

    <rect class="b" x="252" y="310" width="334" height="46" />
    <rect class="soft" x="268" y="320" width="110" height="26" rx="2" />
    <rect class="soft" x="398" y="320" width="128" height="26" rx="2" />
    <!-- its control box -->
    <rect class="b" x="536" y="318" width="38" height="30" rx="3" />
    <circle cx="547" cy="333" r="4.5" />
    <circle class="fill" cx="563" cy="333" r="3" />
    <circle class="soft" cx="563" cy="333" r="5.5" />
  </g>

  <!-- the belt, its ticks and rollers turning as it runs -->
  <g>
    <rect class="b" x="259" y="296" width="320" height="14" />
    <g clip-path="url(#hm-belt)">
      <g class="ticks">
        <path class="soft" d={ticks.map((x) => `M${x} 298v10`).join('')} />
      </g>
    </g>
    {#each [259, 579] as cx}
      <circle class="b" {cx} cy="303" r="7" />
      <path class="soft spin" d="M{cx} 297.5V308.5" />
      <circle class="fill" {cx} cy="303" r="1.6" />
    {/each}
  </g>

  <!-- the forms printer, on its post at the far left: its print unit, the two rolls the forms come out between (a
       perforation between pages, nothing down the sides: tractor holes would read as fanfold, which REED doesn't
       print), the knife that cuts a page off, and the box on the floor it falls into -->
  <g>
    <rect class="b" x="96" y="210" width="12" height="230" />
    <path class="p" d="M92 440h20l3 12h-26z" />
    <path d="M92 440h20l3 12h-26z" fill="url(#hm-hatch)" stroke="none" />

    <rect class="b" x="12" y="210" width="90" height="46" rx="4" />
    <rect class="soft" x="68" y="218" width="26" height="12" rx="1" />
    <circle cx="26" cy="224" r="2.5" />
    <circle class="fill" cx="36" cy="224" r="2.5" />
    <path class="soft" d="M22 242H58M22 248H58" />
    <rect class="b" x="20" y="256" width="6" height="46" />
    <rect class="b" x="88" y="256" width="6" height="46" />
    {#each [['up', 262], ['down', 282]] as [way, top]}
      <rect class="b" x="26" y={top} width="62" height="20" rx="9" />
      <g clip-path="url(#hm-roll-{way})">
        <g class="roll roll--{way}">
          <path class="soft" d={stripes[way].map((y) => `M33 ${y}H81`).join('')} />
        </g>
      </g>
    {/each}
    {#each [272, 292] as cy}
      <circle class="b" cx="23" {cy} r="2.5" />
      <circle class="b" cx="91" {cy} r="2.5" />
    {/each}

    {#each [{ tops: feed, cls: 'feed', clip: 'nip' }, { tops: [CUT], cls: 'fall', clip: 'floor' }] as { tops, cls, clip }}
      <g clip-path="url(#hm-{clip})">
        <g class={cls}>
          <!-- the fills first, so a page's fill doesn't cover the perforation above it; the joined pages' edge there is
               only the perforation, the lowest one's bottom and a cut page's top are cut edges -->
          {#each tops as y}
            <rect class="b" x="32" {y} width="50" height={PAGE} stroke="none" />
          {/each}
          {#each tops as y, i}
            {#if cls === 'fall'}
              <rect x="32" {y} width="50" height={PAGE} />
            {:else}
              <path d="M32 {y}V{y + PAGE}M82 {y}V{y + PAGE}{i ? '' : `M32 ${y + PAGE}H82`}" />
              <path class="soft perf" d="M32 {y}H82" />
            {/if}
            <path class="soft" d="M44 {y + 8}H70M44 {y + 13}H70M44 {y + 18}H64" />
            <rect class="mark" x="44" y={y + 24} width="11" height="5" />
            <path class="soft" d="M44 {y + 34}H70M44 {y + 39}H66" />
          {/each}
        </g>
      </g>
    {/each}

    <!-- the knife, on the post at the perforation's line: in across the forms and back -->
    <g class="knife">
      <path class="b" d="M89 305.5L78 308L89 310.5Z" />
      <rect class="b" x="89" y="303" width="12" height="10" rx="1.5" />
    </g>

    <!-- the box, a few forms in it showing over its front -->
    <rect class="b" x="38" y="388" width="44" height="16" transform="rotate(-5 60 396)" />
    <rect class="b" x="32" y="392" width="44" height="12" transform="rotate(4 54 398)" />
    <path d="M24 398L15 389M90 398L99 389" />
    <rect class="b" x="24" y="398" width="66" height="54" />
    <g class="tapes"><rect class="tape" x="24" y="423" width="66" height="9" /></g>
    <!-- its cable to the printer -->
    <path class="soft" d="M108 236C116 236 114 250 122 250" />
  </g>

  <!-- the printer, by the bench: a paper hopper on top, blank sheets standing in it, the front one going in and the
       ones behind coming forward; screen, buttons, the out tray with what it's printed (the print the mark), the door
       with REED's plate. It shakes while it prints. -->
  <g>
    <path class="p" d="M118 440h130v12H118z" />
    <path d="M118 440h130v12H118z" fill="url(#hm-hatch)" stroke="none" />
    <g class="shake">
      {#each HOPPER as sheet}
        <rect
          class="b behind"
          x={sheet.x}
          y={sheet.y}
          width="56"
          height="30"
          style="--from: {sheet.from}; --to: {sheet.to}; opacity: {sheet.from}" />
      {/each}
      <rect class="b sheet-in" x="162" y="98" width="56" height="30" />
      <path class="b" d="M150 120H230L218 160H162Z" />
      <path class="soft" d="M156 128H224" />
      <rect class="b" x="122" y="160" width="122" height="280" rx="4" />
      <path d="M122 176H244" />
      <rect class="b" x="136" y="192" width="52" height="32" rx="3" />
      <path class="soft" d="M143 202H174M143 209H181M143 216H164" />
      <circle cx="204" cy="200" r="4" />
      <circle class="lit" cx="218" cy="200" r="4" />
      <circle cx="232" cy="200" r="4" />
      <path class="soft" d="M200 216H236" />

      <!-- the out tray: the slot it comes out of, the printed sheets standing in the tray, the one just printed -->
      <rect class="p" x="140" y="248" width="86" height="6" rx="3" />
      <rect class="leaf" x="154" y="262" width="66" height="40" style="fill-opacity: 0.08" />
      <rect class="leaf" x="152" y="264" width="66" height="40" style="fill-opacity: 0.14" />
      {#each [false, true] as out}
        <g clip-path={out ? 'url(#hm-tray)' : null}>
          <g class:sheet-out={out}>
            <rect class="b" x="148" y="266" width="66" height="40" />
            <path class="soft" d="M156 274H198M156 279H204M156 284H190" />
            <rect class="mark" x="156" y="289" width="14" height="6" rx="1" />
            <path class="soft" d="M176 290H204M176 294H196" />
          </g>
        </g>
      {/each}
      <path class="b" d="M136 300H230L224 318H142Z" />
      <path class="soft" d="M142 306H224" />

      <rect x="134" y="336" width="98" height="92" rx="3" />
      <path class="soft" d="M134 350h4M134 414h4" />
      <rect class="b" x="218" y="370" width="6" height="22" rx="3" />
      <image href="/logo.svg" x="146" y="348" width="46" height="21" />
    </g>
  </g>

  <!-- the stamp press: head, lever (its swing arrowed), spring-loaded ram, the self-inking stamp (its inked plate the
       mark) over a business card; the lever pulled, the ram comes down and stamps it -->
  <g>
    <g class="ram">
      <rect class="b" x="282" y="110" width="8" height="94" />
      <rect class="b" x="264" y="204" width="44" height="10" rx="2" />
      <path class="soft" d="M265 222V254H307V222" />
      <path class="b" d="M273 214H299L303 248H269Z" />
      <path class="soft" d="M279 230H293" />
      <rect class="mark" x="270" y="250" width="32" height="5" rx="1" />
      <!-- its plate hot: glowing round it, brighter -->
      <g class="pressed">
        <rect class="glow glow--wide" x="270" y="250" width="32" height="5" rx="1" />
        <rect class="glow" x="270" y="250" width="32" height="5" rx="1" />
        <rect class="hot" x="270" y="250" width="32" height="5" rx="1" />
      </g>
    </g>
    <rect class="b" x="252" y="102" width="92" height="30" rx="4" />
    <path class="soft" d="M258 124H338" />
    <path class="soft" d={lever} />
    <g class="lever">
      <rect class="b" x="286" y="109" width="56" height="10" rx="5" transform="rotate(-120 286 114)" />
      <circle class="b" cx="258" cy="65.5" r="7" />
    </g>
    <circle class="b" cx="286" cy="114" r="5" />
    <circle class="fill" cx="286" cy="114" r="1.5" />
    <rect class="b" x="272" y="132" width="28" height="18" rx="2" />
    <path class="soft spring" d={spring} />
  </g>

  <!-- the engraver: beam, carriage, cylinder, the engraving head over the mug (a cylinder, a faint band of the logo's
       orange round it, its tip tapered); and the rotator beside it. Both come down - the head behind the mug, the
       rotator's wheel on its side - and the mug turns once round, its engraving (the mark) coming round to the
       front. -->
  <g>
    <g class="engraver">
      <rect class="b" x="383" y="92" width="6" height="94" />
      <rect class="b" x="372" y="186" width="28" height="7" rx="2" />
      <rect class="b" x="377" y="193" width="18" height="28" rx="2" />
      <rect class="stripe" x="378" y="208" width="16" height="9" />
      <path class="soft" d="M381 196V218" />
      <path class="b" d="M378 221H394L388 230H384Z" />
    </g>
    <rect class="b" x="358" y="76" width="74" height="22" rx="4" />
    <path class="soft" d="M364 92H426" />
    <rect class="b" x="365" y="98" width="42" height="18" rx="2" />
    <circle class="soft" cx="374" cy="107" r="3" />
    <circle class="soft" cx="398" cy="107" r="3" />
    <path class="soft" d="M396 122C407 122 408 134 416 134M396 154C408 154 408 146 416 146" />
    <rect class="b" x="376" y="116" width="20" height="44" rx="2" />
    <path class="soft" d="M376 124h20M376 152h20" />
    <g class="rotator">
      <rect class="b" x="338" y="238" width="26" height="8" rx="1" />
      <rect class="b" x="344" y="226" width="16" height="12" rx="2" />
      <path class="soft" d="M344 231H360" />
      <circle class="b" cx="366" cy="242" r="4" />
      <path class="soft spin" d="M366 238.5V245.5" />
    </g>
  </g>

  <!-- the laser: gantry crossbar, its cable chain and stack light, the head and its beam, firing on the pen below; the
       engraving is the mark -->
  <g>
    <rect class="b" x="446" y="82" width="134" height="18" rx="4" />
    <path class="soft" d="M452 95H574" />
    <rect class="b" x="494" y="40" width="8" height="42" rx="1" />
    <path class="b" d="M466 82H526A20 20 0 0 0 526 42H502V50H526A12 12 0 0 1 526 74H466Z" />
    <path
      class="links"
      d="M474 74v8M482 74v8M490 74v8M498 74v8M506 74v8M514 74v8M522 74v8M510 42v8M518 42v8M538 62h8M534.5 70.5l5.6 5.6M534.5 53.5l5.6-5.6" />
    <rect class="b" x="562" y="70" width="12" height="12" />
    <rect class="lit" x="562" y="60" width="12" height="10" />
    <rect class="b" x="562" y="50" width="12" height="10" />
    <path d="M564 50V47H572V50" />
    <rect class="b" x="496" y="100" width="40" height="52" rx="3" />
    <path d="M516 111L524 125H508Z" />
    <path d="M516 116V120" />
    <circle class="fill" cx="516" cy="122.5" r="0.9" />
    <path class="soft" d="M503 134H529M503 140H529M503 146H529" />
    <rect class="b" x="509" y="152" width="14" height="20" />
    <path class="b" d="M509 172H523L519 186H513Z" />
    <g class="firing">
      <path class="beam-glow" d="M516 187V289" />
      <path class="beam" d="M516 187V289" />
      <path class="spark" d="M507 284l-6-3M525 284l6-3M510 279l-3-5M522 279l3-5" />
    </g>
  </g>

  <!-- out: the chute (what the belt brings slides down it, into the boxes, at its tilt), pinned by the end roller, a
       strut under it to the bench, its foot on the box's rim -->
  <path class="b" d="M585.7 339.1L603.5 314.6L606.1 316.4L588.3 340.9Z" />
  <circle class="soft" cx="587" cy="340" r="1.8" />
  <path class="b" d="M584 296.7L630 327.7L627.8 331L581.8 300Z" />
  <circle class="fill" cx="585" cy="299" r="1.6" />

  <!-- on the belt, each under its station: a business card lying flat (the stamp's print on its face), a mug (its
       handle drawn behind it and in front, for its turn), a pen (its clip by the cap, pointing to the tip) -->
  <g class="item card-item">
    <path class="card" d="M269 289H303L306 294H266Z" />
    <rect class="card" x="266" y="294" width="40" height="2" />
    <path class="mark stamped" d="M279 290H293L294.5 293H277.5Z" />
  </g>
  <g class="item mug-item">
    {#each ['handle', 'body', 'handle handle-front'] as part}
      {#if part === 'body'}
        <path class="b" d="M370 258H402V290Q402 296 396 296H376Q370 296 370 290Z" />
        <path class="soft" d="M370 263H402" />
        <rect class="mark turned" x="378" y="272" width="16" height="9" rx="1.5" />
      {:else}
        <g class={part}>
          <path class="b" d="M402 266C414 266 416 286 402 288" />
          <path class="soft" d="M402 271C409 271 410 282 402 283" />
        </g>
      {/if}
    {/each}
  </g>
  <g class="item pen-item">
    <path class="b" d="M489 289L478 291.5L489 294Z" />
    <rect class="b" x="488" y="287" width="56" height="9" rx="4.5" />
    <path class="soft" d="M502 287v9" />
    <path d="M540 287V283H528" />
    <rect class="mark engraved" x="510" y="289" width="14" height="5" rx="1" />
  </g>

  <!-- the boxes: pens leaning against each other in the open one, against its right edge; REED's tape round them, and
       down the closed one, with its shipping label -->
  <g>
    {#each [[652, 22], [660, 20], [668, 18]] as [x, lean]}
      <rect class="b" x={x - 2.5} y="306" width="5" height="56" rx="2.5" transform="rotate({lean} {x} 362)" />
    {/each}
    <path d="M612 330L600 318M680 330L692 318" />
    <rect class="b" x="612" y="330" width="68" height="42" />
    <g class="tapes"><rect class="tape" x="612" y="342" width="68" height="9" /></g>
    <rect class="b" x="600" y="372" width="96" height="80" />
    <!-- (round it and down it, over the top and under: faint together, one over the other where they cross) -->
    <g class="tapes">
      <rect class="tape" x="600" y="423" width="96" height="9" />
      <rect class="tape tape--down" x="633.5" y="372" width="9" height="80" />
    </g>
    <path class="soft" d="M612 412V398M608 402l4-4 4 4M624 412V398M620 402l4-4 4 4" />
    <!-- its shipping label: a white card, outlined, a few lines on it -->
    <g class="shipping">
      <rect x="661" y="399" width="26" height="17" rx="1" />
      <path d="M665 404H679M665 407.5H683M665 411H676" />
    </g>
  </g>

  {#each bolts as [cx, cy]}
    <circle class="soft" {cx} {cy} r="1.8" />
  {/each}

  <!-- centre lines, last: they run over the parts, as on a drawing -->
  <path class="centre" d="M{ITEMS.card} 94V300M{ITEMS.mug} 100V302M472 291.5H558" />
</svg>

<style>
  .machine {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
    color: #e6edf7;
  }
  /* lines keep their weight on screen whatever size the drawing is */
  .machine :global(*) {
    vector-effect: non-scaling-stroke;
  }
  /* the parts are filled, so whatever stands behind them is hidden, as on a drawing */
  .b {
    fill: #21395d;
  }
  .p {
    fill: var(--navy);
  }
  .fill {
    fill: currentColor;
    stroke: none;
  }
  .soft {
    stroke-width: 1;
    stroke-opacity: 0.45;
  }
  /* further back than the soft lines: the shirt rack's frame */
  .faint {
    stroke-width: 1;
    stroke-opacity: 0.3;
  }
  /* further back still: the dispensers, outlines only */
  .ghost {
    stroke-width: 1;
    stroke-opacity: 0.22;
  }
  /* on the wall behind the rack, a little faint */
  .wall {
    opacity: 0.75;
  }
  /* the desk calendar behind the other */
  .far {
    opacity: 0.45;
  }
  .links {
    stroke-width: 1;
    stroke-opacity: 0.8;
  }
  .ground {
    stroke-opacity: 0.35;
  }
  .centre {
    stroke-width: 0.8;
    stroke-opacity: 0.28;
    stroke-dasharray: 10 4 2 4;
  }
  /* a sheet of paper standing behind another, faint (not .sheet: the site's page is one) */
  .leaf {
    fill: currentColor;
  }
  .perf {
    stroke-dasharray: 2 3;
  }
  /* the wall calendar's today: its day's box drawn heavier */
  .today {
    stroke-width: 2;
  }
  /* a business card: paper, lighter than the parts */
  .card {
    fill: #3a5682;
  }
  /* lit: the stack light's lamp that's on, the printer's ready light */
  .lit {
    fill: currentColor;
    fill-opacity: 0.55;
  }
  /* a faint band of the logo's orange round the engraving head, as big as the logo it engraves on the mug: its paint,
     behind the mug while it engraves, level with the logo's place */
  .stripe {
    fill: var(--orange-small);
    fill-opacity: 0.45;
    stroke: none;
  }
  /* a shipping label: a white card, outlined (white itself, not the site's .label's colour: its own class) */
  .shipping rect {
    fill: #fff;
    fill-opacity: 0.04;
    stroke: #fff;
    stroke-width: 1;
    stroke-opacity: 0.4;
  }
  .shipping path {
    stroke: #fff;
    stroke-width: 1;
    stroke-opacity: 0.28;
  }
  /* packing tape, faint */
  .tapes {
    opacity: 0.5;
  }
  .tape {
    fill: url(#hm-tape);
    stroke: none;
  }
  .tape--down {
    fill: url(#hm-tape-down);
  }
  /* the logo's space: the hero line's orange ("z Twoim logo"), outlined like the parts */
  .mark {
    fill: var(--orange-small);
    stroke-width: 1;
  }
  .beam {
    stroke-width: 1;
  }
  .beam-glow,
  .glow {
    stroke: var(--red);
    stroke-width: 4;
    stroke-opacity: 0.6;
  }
  /* the stamp plate's glow, heating up to stamp (only seen running): a soft red halo, the plate a paler orange */
  .pressed {
    opacity: 0;
  }
  .glow--wide {
    stroke-width: 9;
    stroke-opacity: 0.25;
  }
  .hot {
    fill: #ffb27a;
    stroke: none;
  }
  .spark {
    stroke: #ff6b76;
    stroke-width: 1.4;
  }
  /* only seen running: the page cut off, falling */
  .fall {
    opacity: 0;
  }
  /* what turns turns about its own middle (a line across a roller or a wheel) */
  .spin {
    transform-box: fill-box;
    transform-origin: center;
  }

  /* Running: each part gets its keyframes (written in the script, from the timings there) over its machine's cycle,
     moving about where it's drawn (its transform's origin in the drawing's own units). */
  @media (prefers-reduced-motion: no-preference) {
    /* the belt */
    .ram {
      animation: hm-stamp var(--belt) linear infinite;
    }
    .lever {
      transform-origin: 286px 114px;
      animation: hm-pull var(--belt) linear infinite;
    }
    .spring {
      transform-origin: 286px 152px;
      animation: hm-stretch var(--belt) linear infinite;
    }
    .engraver {
      --down: 64px; /* (its band, the logo's paint, level with the logo's place on the mug, behind it) */
      animation: hm-lower var(--belt) linear infinite;
    }
    .rotator {
      --down: 18px;
      animation: hm-lower var(--belt) linear infinite;
    }
    .pressed {
      animation: hm-pressed var(--belt) linear infinite;
    }
    .rotator .spin {
      animation: hm-wheel var(--belt) linear infinite;
    }
    .handle {
      transform-origin: 386px 0;
      animation: hm-handle var(--belt) linear infinite;
    }
    .handle-front {
      animation:
        hm-handle var(--belt) linear infinite,
        hm-handle-front var(--belt) linear infinite;
    }
    .turned {
      transform-origin: 386px 0;
      animation: hm-turned var(--belt) linear infinite;
    }
    .firing {
      animation: hm-fire var(--belt) linear infinite;
    }
    .spark {
      animation: hm-sparks var(--belt) linear infinite;
    }
    .stamped {
      animation: hm-stamped var(--belt) linear infinite;
    }
    .engraved {
      animation: hm-engraved var(--belt) linear infinite;
    }
    .ticks {
      animation: hm-run var(--belt) linear infinite;
    }
    .spin {
      animation: hm-spin var(--belt) linear infinite;
    }
    .stack {
      animation: hm-dispense var(--belt) linear infinite;
    }
    .queue {
      animation: hm-queue var(--belt) linear infinite;
    }
    /* each turns about the middle of its foot */
    .card-item {
      transform-origin: 286px 296px;
      animation: hm-card var(--belt) linear infinite;
    }
    .mug-item {
      transform-origin: 386px 296px;
      animation: hm-mug var(--belt) linear infinite;
    }
    .pen-item {
      transform-origin: 511px 296px;
      animation: hm-pen var(--belt) linear infinite;
    }

    /* the printer */
    .shake {
      animation: hm-shake var(--print) linear infinite;
    }
    .sheet-in {
      animation: hm-take var(--print) linear infinite;
    }
    .behind {
      animation: hm-behind var(--print) linear infinite;
    }
    .sheet-out {
      animation: hm-give var(--print) linear infinite;
    }

    /* the forms printer (the rolls' faces turning with the feed) */
    .feed {
      --by: 44px;
      animation: hm-feed var(--forms) linear infinite;
    }
    .roll--up {
      --by: -44px;
      animation: hm-feed var(--forms) linear infinite;
    }
    .roll--down {
      --by: 44px;
      animation: hm-feed var(--forms) linear infinite;
    }
    .knife {
      animation: hm-cut var(--forms) linear infinite;
    }
    .fall {
      transform-origin: 57px 330px;
      animation: hm-fall var(--forms) linear infinite;
    }
  }
</style>
