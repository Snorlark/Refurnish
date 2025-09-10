## Backend Architecture: Feature-Based Monolith

src/
│ ├── app.ts // Main entry file
│ ├── config/
│ │ ├── db.ts // MongoDB connection
│ │ └── index.ts // Environment variables
│ ├── middleware/
│ │ └── auth.ts // JWT authentication middleware
│ ├── modules/
│ │ ├── users/ // User-related logic
│ │ │ ├── controllers/
│ │ │ │ └── user.controller.ts
│ │ │ ├── models/
│ │ │ │ └── user.model.ts
│ │ │ └── routes/
│ │ │ │ └── user.routes.ts
│ │ ├── products/ // Product-related logic
│ │ │ ├── controllers/
│ │ │ │ └── product.controller.ts
│ │ │ ├── models/
│ │ │ │ └── product.model.ts
│ │ │ └── routes/
│ │ │ │ └── product.routes.ts
│ │ └── ... (other features: orders, cart, etc.)
│ └── server.ts // Starts the server
├── package.json
└── tsconfig.json
