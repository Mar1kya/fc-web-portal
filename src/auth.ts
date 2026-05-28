import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "../generated/prisma";
import { SignInSchema } from "./lib/schemas";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = SignInSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            return user;
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email && user.id) {
        try {
          await prisma.order.updateMany({
            where: {
              email: user.email.toLowerCase(),
              userId: null,
            },
            data: {
              userId: user.id,
            },
          });
        } catch (error) {
          console.error(error);
        }
      }
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email && user.id) {
        try {
          await prisma.order.updateMany({
            where: { email: user.email.toLowerCase(), userId: null },
            data: { userId: user.id },
          });
        } catch (error) {
          console.error(error);
        }
      }
    },
  },
});
