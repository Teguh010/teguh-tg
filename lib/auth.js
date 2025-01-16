import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
//import { user } from "@/app/api/user/data";
//import bcrypt from "bcrypt";
//import GoogleProvider from "next-auth/providers/google";
//import GithubProvider from "next-auth/providers/github";

import { apiAuth } from '@/models/common'

let accessToken = null;
let refreshTokenTimeout = null;

export const authOptions = {
  providers: [
    /* GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }), */
    /*  GithubProvider({
       clientId: process.env.AUTH_GITHUB_ID,
       clientSecret: process.env.AUTH_GITHUB_SECRET,
     }), */
    /* Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }
        const foundUser = user.find((u) => u.email === credentials.email);

        if (!foundUser) {
          throw new Error("User not found");
        }

        //  check correctPassword plain without bcrypt
        const correctPassword = credentials.password === foundUser.password;

        if (!correctPassword) {
          throw new Error("Invalid password");
        }

        return foundUser;
      },
      callbacks: {
        async signIn({ user }) {
          if (!user.email?.endsWith(process.env.ALLOWED_DOMAIN)) {
            throw new Error("You are not allowed to access this platform");
          }
          return true;
        },

        Bearer: async ({ token, user }) => {
          if (user) {
            token.role = user.role;
          }
          return token;
        },
        async session({ session, token }) {
          if (session.user) {
            session.user.role = token.role;
          }
          return session;
        },
      },
    }), */
    CredentialsProvider({
      id: "tracegrid-login",
      name: "Tracegrid",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        //try {
        /* const response = await axios.post("https://api.dev.tracegrid.com/auth", {
          username: credentials.username,
          password: credentials.password,
        }, {
          headers: {
            "Content-Type": "application/json",
          }
        }); */
        const response = await fetch(process.env.TRACEGRID_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
          }),
        });
        console.error("Error en la solicitud:", response.status, response.statusText);
        //console.error("headers:", response.headers);


        if (response.ok) {
          accessToken = response.data.access_token;
          //setRefreshTokenTimer(response.data.access_token);
          setRefreshTokenTimer(credentials);
          return { accessToken: response.data.access_token };
        } else {
          return null;
        }
        /*  } catch (error) {
           return null;
         } */
      },
      session: {
        Bearer: true,
      },
      callbacks: {
        /* async signIn({ user }) {
          if (!user.email?.endsWith(process.env.ALLOWED_DOMAIN)) {
            throw new Error("You are not allowed to access this platform");
          }
          return true;
        }, */
        Bearer: async ({ token, user }) => {
          if (user) {
            token.role = user.role;
          }
          return token;
        },
        async session({ session, token }) {
          if (session.user) {
            session.user.role = token.role;
          }
          return session;
        },
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "Bearer",
  },
  debug: process.env.NODE_ENV !== "production",
};

/* function setRefreshTokenTimer(credentials) {
  clearTimeout(refreshTokenTimeout);
  // Set a timeout to refresh the token every 5 minutes
  refreshTokenTimeout = setTimeout(async () => {
    try {
      const response = await axios.post(process.env.NEXTAUTH_URL_TRACEGRID_API, {
        username: credentials.username,
        password: credentials.password,
      });
      if (response.data.access_token) {
        accessToken = response.data.access_token;
        setRefreshTokenTimer(response.data.access_token);
      }
    } catch (error) {
      console.error("Failed to refresh token", error);
    }
  }, 5 * 60 * 1000); // 5 minutes
} */

/* function setRefreshTokenTimer(token) {
  clearTimeout(refreshTokenTimeout);
  // Set a timeout to refresh the token every 5 minutes
  refreshTokenTimeout = setTimeout(async () => {
    try {
      const response = await axios.post("https://api.dev.tracegrid.com/auth/refresh", { token });
      if (response.data.access_token) {
        accessToken = response.data.access_token;
        setRefreshTokenTimer(response.data.access_token);
      }
    } catch (error) {
      console.error("Failed to refresh token", error);
    }
  }, 5 * 60 * 1000); // 5 minutes
} */

/*   const response = await fetch("https://api.dev.tracegrid.com/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: data.email,
      password: data.password,
    }),
  });
  const result = await response.json();
  if (response.ok) {
    toast.success("Login Successful");
    window.location.assign("/dashboard");
    reset();
  } else {
    toast.error(result.message || "Login Failed");
  } */

export const relogin = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    const { username, password, customer } = userData

    if (!username || !password || !customer) {
      console.error('User data is incomplete in local storage')
      return null
    }

    const authResponse = await apiAuth(username, password, customer)
    const newToken = authResponse?.access_token

    if (newToken) {
      const updatedUser = {
        ...userData,
        token: newToken,
      }

      localStorage.setItem('userData', JSON.stringify(updatedUser))
      return newToken
    }

    return null
  } catch (error) {
    console.error('Relogin failed:', error)
    return null
  }
}