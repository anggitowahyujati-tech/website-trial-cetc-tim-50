# ATLAS: web + mobile terhubung
Jalankan lokal: `npm start` → web http://localhost:3000/ · mobile http://localhost:3000/mobile
Deploy (HTTPS otomatis): Render / Railway / Fly.io → Node, start command `npm start`.
Opsional env: PORT, DATA_FILE (path data.json, taruh di disk persisten), ADMIN (token untuk POST /api/reset).
Reset demo: curl -X POST -H "x-admin: TOKEN" https://DOMAIN/api/reset
