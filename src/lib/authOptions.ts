import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "dummy",
      clientSecret: process.env.GITHUB_SECRET || "dummy",
    }),
    CredentialsProvider({
      name: "Test Account",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "testuser" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Create or find a dummy user for testing
        let user = await prisma.user.findFirst({ where: { email: "test@example.com" } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: "Test User",
              email: "test@example.com",
              subscriptionPlan: "premium",
            }
          });
        } else if (user.subscriptionPlan !== "premium") {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { subscriptionPlan: "premium" },
          });
        }
        return { id: user.id, name: user.name, email: user.email };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};
