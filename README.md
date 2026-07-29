# YGD

A Y2K / MySpace-inspired personal site with a **grunge, distressed** look.
Three pages, one aesthetic:

| Page | File | What it is |
|------|------|------------|
| **Home** | `index.html` | The classic MySpace-style profile, rebranded **YGD**, with the (swappable) portrait, blurbs, top friends and guestbook. |
| **Blogs** | `blog.html` | Every blog post (picture **or** video, title, description, time of post) in a feed, plus a right-hand **"stack"** navigator listing the time + title of each post to jump to. |
| **Admin** | `admin.html` (served at `/admin`) | Hidden webmaster console to add new blogs. Only reachable by signing in with the owner's Google account via **Firebase**. |

Navigation everywhere is just **home · search · blogs** — as requested.

> The portrait at `assets/profile.svg` is a placeholder. Drop in your own
> photo (e.g. `assets/profile.jpg`) and update the `<img src>` in
> `index.html` to use it.

---

## Run it locally

It's a static site — any static server works:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Out of the box it runs in **DEMO MODE**: the blog page shows sample posts and
the admin console is view-only. Everything below turns it live.

---

## Connect Firebase (auth + blog storage)

1. Create a project at <https://console.firebase.google.com>.
2. **Add a Web App** and copy its config into `js/firebase-config.js`
   (replace the `YOUR_...` placeholders).
3. **Authentication → Sign-in method →** enable **Google**.
4. **Firestore Database →** create it, then paste the rules below.
5. *(Optional)* **Storage →** enable it if you want to upload media files
   from the admin page instead of pasting URLs.

The owner account is set in `js/firebase-config.js`:

```js
export const ADMIN_EMAIL = "b1tchimd1@gmail.com";
```

Only that Google account can open `/admin` or write posts.

### Firestore security rules

Anyone can read blogs; only the owner can write them:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /blogs/{doc} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email == "b1tchimd1@gmail.com";
    }
  }
}
```

### Storage rules (only if you enabled Storage)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /blogs/{file=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email == "b1tchimd1@gmail.com";
    }
  }
}
```

---

## Deploy (so `/admin` works as a clean URL)

`firebase.json` is set up with `cleanUrls` and a rewrite so
`yourdomain.com/admin` serves the console:

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # pick your project
firebase deploy
```

Add your deployed domain under **Authentication → Settings → Authorized
domains** so Google sign-in is allowed there.

---

## How posting works

1. Owner visits `/admin` and signs in with the authorized Google account.
   (Any other account gets an "Access Denied" screen.)
2. Fill in **title, description, media type (picture/video)** and either paste
   a media URL or upload a file.
3. Publish → the post is written to the `blogs` collection with a server
   timestamp and appears on the blog page **live** (no refresh needed).

## Structure

```
index.html              home / profile
blog.html               blog feed + stack navigator
admin.html              webmaster console (served at /admin)
css/style.css           the whole Y2K grunge design system
js/firebase-config.js   <- put your keys + owner email here
js/data.js              demo posts (fallback / demo mode)
js/blog.js              loads + renders posts and the stack nav
js/admin.js             Google auth gate + post publishing
assets/profile.svg      placeholder portrait (swap for your own)
firebase.json           hosting config (cleanUrls + /admin rewrite)
```
