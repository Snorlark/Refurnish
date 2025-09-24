import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { NextAuthOptions } from 'next-auth'

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          console.log('Google OAuth user data:', { user, account, profile });
          
          // Extract name parts more carefully, with fallbacks
          const fullName = user.name || profile?.name || '';
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || profile?.given_name || '';
          const lastName = nameParts.slice(1).join(' ') || profile?.family_name || '';
          
          const googleData = {
            googleId: user.id,
            email: user.email,
            firstName: firstName,
            lastName: lastName,
            profilePicture: user.image || profile?.picture,
          };
          
          console.log('Sending to backend:', googleData);
          
          // Send user data to your backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/google-auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(googleData),
          });

          if (response.ok) {
            const data = await response.json();
            // Store the backend token and user data in the user object
            (user as any).backendToken = data.token;
            (user as any).backendUser = data.user;
            console.log('Backend authentication successful:', data);
          } else {
            const errorData = await response.json();
            console.error('Backend authentication failed:', errorData);
            return false; // Prevent sign in if backend fails
          }
        } catch (error) {
          console.error('Error syncing with backend:', error);
          return false; // Prevent sign in if backend fails
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.accessToken = account.access_token
        token.id = user.id
        token.backendToken = (user as any).backendToken
        token.backendUser = (user as any).backendUser
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id as string
        session.accessToken = token.accessToken as string
        session.backendToken = token.backendToken as string
        session.backendUser = token.backendUser as any
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
