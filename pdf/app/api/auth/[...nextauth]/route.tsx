import NextAuth, { NextAuthOptions } from "next-auth";
import prisma from "../../../../libs/prismadb";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvidr from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    CredentialsProvidr({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Ajaya" },
        password: { label: "password", type: "text", placeholder: "password" },
        username: { label: "Username", type: "text", placeholder: "Ajaya K C" },
      },
      async authorize(credentials) {
        // Check to see if email and password are there
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password");
        }

        //Check to see if user exists
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        //If no user was found
        if (!user || !user?.hashedPassword) {
          throw new Error("No user found");
        }

        //Check to see if password match
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        //If password does not match
        if (!passwordMatch) {
          throw new Error("Incorrect password");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, session }) {
      // console.log(
      //   "JWT Callback",
      //   "JTW token",
      //   token,
      //   "JWT use",
      //   user,
      //   "JWT session",
      //   session
      // );

      //On sign in there will be a user
      //So pass the user data into the token, which will be then passed ito the session token
      if (user) {
        return { ...token, id: user.id };
      }

      return token;
    },
    async session({ session, token, user }) {
      // console.log(
      //   "Session callback",
      //   "Session session",
      //   session,
      //   "Session token",
      //   token,
      //   "Session user",
      //   user
      // );

      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        },
      };
    },
  },
  secret: process.env.SECRET,
  session: {
    strategy: "jwt",
  },

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
