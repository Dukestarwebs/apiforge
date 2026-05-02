# APKForge API Reference

Base URL: `https://api.apkforge.dev/api/v1`

## Auth
All endpoints require: `x-api-key: apkf_your_key`

Admin key (set in .env as ADMIN_API_KEY): `apkf_admin_xxx`
- No credit deductions
- No rate limiting
- Unlimited builds

## Endpoints
- POST   /auth/register
- POST   /auth/login
- POST   /build/estimate
- POST   /build
- GET    /build/status/:jobId
- GET    /build/download/:jobId
- GET    /builds
- DELETE /builds/:jobId
- GET    /credits/balance
- GET    /credits/packs
- POST   /credits/purchase
- GET    /credits/purchase/:txId/status
- GET    /credits/transactions
- GET    /keys
- POST   /keys
- DELETE /keys/:id
- GET    /subscription
- POST   /subscription/upgrade
- GET    /user/profile
- PUT    /user/profile
- DELETE /user/account
- POST   /keystore/upload
- GET    /keystore
- DELETE /keystore
- POST   /webhooks/github  (internal — called by GitHub Actions)
- POST   /webhooks/julypay (internal — called by JulyPay)

See APKForge_Developer_Guide.docx for full request/response examples.
