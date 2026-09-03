import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/account/login",
    newUser: "/account/register",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Por favor ingresa tu email y contraseña.");
        }

        const cleanEmail = credentials.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (!user || !user.passwordHash) {
          throw new Error("El correo electrónico o la contraseña son incorrectos.");
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordMatch) {
          throw new Error("El correo electrónico o la contraseña son incorrectos.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split("@")[0],
          role: user.role,
          loyaltyPoints: user.loyaltyPoints,
          image: user.image || user.avatarUrl,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "CUSTOMER";
        token.loyaltyPoints = (user as any).loyaltyPoints || 0;
      }

      // Permite actualizar puntos de fidelidad dinámicamente desde la sesión
      if (trigger === "update" && session?.loyaltyPoints !== undefined) {
        token.loyaltyPoints = session.loyaltyPoints;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).loyaltyPoints = token.loyaltyPoints;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "gosu_ecommerce_secret_key_2026_super_secure",
};
