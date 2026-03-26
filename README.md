# dey_make

## OAuth frontend flow

The frontend does not store Google or Facebook secrets.

### Frontend routes involved

- Login/signup page buttons start OAuth by redirecting users to the backend:
  - `https://api.deymake.com/api/v1/auth/oauth/google/redirect`
  - `https://api.deymake.com/api/v1/auth/oauth/facebook/redirect`
- The frontend callback page is:
  - `/auth/callback`

### Important env rule

Do not place `GOOGLE_CLIENT_SECRET` or `FACEBOOK_CLIENT_SECRET` in any `VITE_*` variable.

### Frontend env values

- `VITE_API_BASE_URL=https://api.deymake.com/api/v1` (optional override)
- `VITE_BACKEND_PROXY_TARGET=http://127.0.0.1:8000` for local development

### Production OAuth callback path

After backend OAuth succeeds, users are redirected to:

- `https://deymake.com/auth/callback`
