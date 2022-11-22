import * as dotenv from "dotenv";
dotenv.config();

import fastifyCors from "@fastify/cors";
import fastifySession from "@fastify/secure-session";
import Fastify from "fastify";
import type { RouteShorthandOptions } from "fastify/types/route";
import { FromSchema } from "json-schema-to-ts";
import {
  COOKIE_NAME,
  CORS_ORIGIN_URL,
  PRODUCTION,
  SESSION_KEY,
  SESSION_SECRET,
  SESSION_TTL,
} from "./constants";

const fastify = Fastify({
  logger: PRODUCTION,
});

console.log(CORS_ORIGIN_URL);
console.log(PRODUCTION);
console.log(COOKIE_NAME);
console.log(SESSION_TTL);
console.log(SESSION_SECRET);

fastify.register(fastifyCors, {
  origin: CORS_ORIGIN_URL,
  credentials: true,
});
fastify.register(fastifySession, {
  cookieName: COOKIE_NAME,
  secret: SESSION_SECRET,
  salt: SESSION_SECRET.substring(3, 19),
  cookie: {
    secure: PRODUCTION ? true : undefined,
    httpOnly: true,
    sameSite: PRODUCTION ? "lax" : undefined,
    maxAge: SESSION_TTL,
  },
});

// routes

// login
const login = {
  type: "object",
  properties: {
    username: { type: "string" },
  },
  required: ["username"],
} as const;

const loginOpts: RouteShorthandOptions = {
  schema: {
    body: login,
    response: {
      403: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      200: {
        type: "object",
        properties: {
          accessToken: {
            type: "string",
          },
          user: {
            type: "object",
            properties: {
              email: {
                type: "string",
              },
            },
          },
        },
      },
    },
  },
};

fastify.post<{ Body: FromSchema<typeof login> }>(
  "/login",
  loginOpts,
  async (request, reply) => {
    const { username } = request.body;

    if (username !== "admin") {
      reply.status(403).send({
        error: "invalid user",
      });
    }

    request.session.set(SESSION_KEY, "user-id-12388123");

    reply.status(200).send({
      accessToken: "as08h13229e2",
      user: {
        email: "admin@email.com",
      },
    });
  }
);

// me
const meOpts: RouteShorthandOptions = {
  schema: {
    response: {
      403: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      200: {
        type: "object",
        properties: {
          accessToken: {
            type: "string",
          },
          user: {
            type: "object",
            properties: {
              email: {
                type: "string",
              },
            },
          },
        },
      },
    },
  },
};

fastify.get("/me", meOpts, async (request, reply) => {
  const user = request.session.get(SESSION_KEY);

  console.log(user);

  if (!user) {
    return reply.status(400).send({
      error: "not authenticated",
    });
  }

  return reply.status(200).send({
    accessToken: "as08h13229e2",
    user: {
      email: "admin@email.com",
    },
  });
});

// logout
fastify.post("/logout", async (request, reply) => {
  try {
    request.session.set(SESSION_KEY, null);
    return reply.send("logged out");
  } catch {
    return reply.send("fail during log out process");
  }
});

// init
const start = async () => {
  try {
    await fastify.listen({ port: 4000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
