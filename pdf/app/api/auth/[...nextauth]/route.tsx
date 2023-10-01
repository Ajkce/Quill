import NextAuth, { NextAuthOptions } from "next-auth";
import prisma from "../../../../libs/prismadb";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvidr from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    CredentialsProvidr({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Ajaya" },
        password: { label: "password", type: "text", placeholder: "password" },
        username: { label: "Username", type: "text", placeholder: "Ajaya K C" },
      },
      async authorize(credentials) {
        const user = { id: 1, name: "Ajaya", email: "ajaya@gmail.com" };
        return user;
      },
    }),
  ],
  secret: process.env.SECRET,
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
