import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/secure-session";
import * as dotenv from "dotenv";
import Fastify from "fastify";
import type { RouteShorthandOptions } from "fastify/types/route";
import { FromSchema } from "json-schema-to-ts";
import {
  COOKIE_NAME,
  PRODUCTION,
  SESSION_KEY,
  SESSION_SECRET,
  SESSION_TTL,
} from "./constants";

dotenv.config();

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyCookie);
fastify.register(fastifySession, {
  secret: SESSION_SECRET,
  salt: SESSION_SECRET.substring(3, 19),
  cookieName: COOKIE_NAME,
  cookie: {
    secure: PRODUCTION,
    httpOnly: true,
    sameSite: PRODUCTION ? "lax" : "none",
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
      return reply.status(403).send({
        error: "invalid user",
      });
    }

    request.session.set(SESSION_KEY, "user-id-12388123");

    return reply.status(200).send({
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
fastify.get("/logout", async (request) => {
  return new Promise((resolve) => {
    try {
      request.session.delete();
      resolve(true);
      return;
    } catch {
      resolve(false);
    }
  });
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
