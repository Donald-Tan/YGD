/* Sample blog posts used when Firebase is not yet configured (DEMO MODE),
   or as a fallback if Firestore can't be reached. */
export const demoBlogs = [
  {
    id: "demo-3",
    title: "3AM thoughts & a busted webcam",
    description:
      "couldn't sleep so i filmed the CRT flicker for like 20 mins. there's " +
      "something holy about phosphor glow at 3am. anyway here's a still. " +
      "signal noise > silence.",
    mediaType: "image",
    mediaUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='560' height='300'%3E%3Crect width='560' height='300' fill='%230b1026'/%3E%3Cg stroke='%236699ff' stroke-opacity='0.25'%3E%3Cline x1='0' y1='40' x2='560' y2='40'/%3E%3Cline x1='0' y1='120' x2='560' y2='120'/%3E%3Cline x1='0' y1='210' x2='560' y2='210'/%3E%3C/g%3E%3Ctext x='280' y='160' fill='%23b6ff00' font-family='monospace' font-size='40' text-anchor='middle'%3ENO SIGNAL%3C/text%3E%3Ctext x='280' y='200' fill='%23ff2d95' font-family='monospace' font-size='18' text-anchor='middle'%3E3:00 AM%3C/text%3E%3C/svg%3E",
    createdAt: "2026-07-27T03:12:00Z",
  },
  {
    id: "demo-2",
    title: "found my old burned CDs",
    description:
      "a whole spindle of them. sharpie labels half rubbed off. ripped one to " +
      "the pc and it STILL plays. they don't make plastic like they used to. " +
      "track 7 goes so hard.",
    mediaType: "image",
    mediaUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='560' height='300'%3E%3Crect width='560' height='300' fill='%232b3a67'/%3E%3Ccircle cx='280' cy='150' r='110' fill='%23c9d3ef'/%3E%3Ccircle cx='280' cy='150' r='34' fill='%232b3a67'/%3E%3Ccircle cx='280' cy='150' r='16' fill='%230b1026'/%3E%3Ctext x='280' y='120' fill='%23123a8f' font-family='monospace' font-size='20' text-anchor='middle'%3EMIX %2701%3C/text%3E%3C/svg%3E",
    createdAt: "2026-07-20T21:44:00Z",
  },
  {
    id: "demo-1",
    title: "welcome to the YGD blog !!",
    description:
      "first post. this is where i dump pics, clips and half-thoughts. " +
      "no algorithm, no ads, just vibes and a hit counter. bookmark it " +
      "(ctrl+D) and check back. sign the guestbook on the way out.",
    mediaType: "image",
    mediaUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='560' height='300'%3E%3Crect width='560' height='300' fill='%23000'/%3E%3Ctext x='280' y='150' fill='%23b6ff00' font-family='monospace' font-size='54' text-anchor='middle'%3EY G D%3C/text%3E%3Ctext x='280' y='200' fill='%23ff2d95' font-family='monospace' font-size='20' text-anchor='middle'%3Eest. right now%3C/text%3E%3C/svg%3E",
    createdAt: "2026-07-15T18:00:00Z",
  },
];
