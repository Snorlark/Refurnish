.
├── apps/
│   ├── api/                          # Express.js REST API backend
│   │   ├── src/
│   │   │   ├── routes/               # API routes
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── buyer.routes.js
│   │   │   │   ├── seller.routes.js
│   │   │   │   └── admin.routes.js
│   │   │   ├── controllers/          # Request -> Response handling
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── product.controller.js
│   │   │   │   └── order.controller.js
│   │   │   ├── services/             # Business logic
│   │   │   │   ├── auth.service.js
│   │   │   │   ├── product.service.js
│   │   │   │   └── order.service.js
│   │   │   ├── models/               # Database schemas/ORM
│   │   │   │   ├── User.js
│   │   │   │   ├── Product.js
│   │   │   │   └── Order.js
│   │   │   ├── middleware/           # Auth, role, validators
│   │   │   │   ├── auth.middleware.js
│   │   │   │   ├── role.middleware.js
│   │   │   │   └── validate.middleware.js
│   │   │   ├── utils/                # Helpers (jwt, logger, error handler)
│   │   │   │   ├── jwt.js
│   │   │   │   └── logger.js
│   │   │   ├── config/               # Environment, DB, Redis, etc.
│   │   │   │   ├── db.js
│   │   │   │   └── redis.js
│   │   │   ├── app.js                # Express app entry
│   │   │   └── server.js             # Server bootstrap
│   │   └── package.json
│   │
│   ├── chat/                         # WebSocket server for real-time features
│   │   ├── src/
│   │   │   ├── handlers/             # WS event handlers
│   │   │   │   └── message.handler.js
│   │   │   ├── services/             # Chat logic (DB save, notifications)
│   │   │   │   └── message.service.js
│   │   │   ├── auth/                 # WebSocket auth
│   │   │   │   └── ws.auth.js
│   │   │   ├── config/               # Redis pub/sub for scaling chat
│   │   │   │   └── redis.js
│   │   │   └── server.js             # WebSocket bootstrap
│   │   └── package.json
│   │
│   └── web/                          # Next.js frontend
│       ├── app/
│       │   ├── (auth)/               # Auth pages
│       │   │   ├── login/page.tsx
│       │   │   └── register/page.tsx
│       │   ├── (buyer)/              # Buyer pages
│       │   │   ├── layout.tsx
│       │   │   ├── products/page.tsx
│       │   │   ├── cart/page.tsx
│       │   │   ├── profile/page.tsx
│       │   │   └── messages/page.tsx
│       │   ├── (seller)/             # Seller pages
│       │   │   ├── layout.tsx
│       │   │   ├── dashboard/page.tsx
│       │   │   ├── products/page.tsx
│       │   │   └── orders/page.tsx
│       │   └── (admin)/              # Admin pages
│       │       ├── layout.tsx
│       │       ├── dashboard/page.tsx
│       │       ├── users/page.tsx
│       │       └── products/page.tsx
│       │
│       ├── components/               # UI components
│       ├── lib/                      # API + WS clients
│       │   ├── api.ts
│       │   └── ws.ts
│       ├── styles/                   # Global styles
│       ├── public/                   # Static assets
│       └── package.json
│
├── packages/                         # Shared across monorepo
│   ├── types/                        # Shared TS types/interfaces
│   │   └── index.ts
│   └── ui/                           # Shared UI components
│       └── Button.tsx
│
├── docker/                           # Deployment configs
│   ├── api.Dockerfile
│   ├── chat.Dockerfile
│   ├── web.Dockerfile
│   └── docker-compose.yml
│
├── .env.example                      # Environment variables template
├── package.json                      # Root monorepo config
├── pnpm-workspace.yaml               # Workspace manager
└── tsconfig.base.json                # Shared TS config
