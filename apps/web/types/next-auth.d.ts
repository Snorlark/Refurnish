import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
    accessToken?: string
    backendToken?: string
    backendUser?: {
      id: string
      firstName: string
      lastName: string
      email: string
      role: 'buyer' | 'seller' | 'admin'
      profilePicture?: string
    }
  }
}
