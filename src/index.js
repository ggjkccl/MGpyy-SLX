
const TELEGRAM_LINKS = [
  "https://t.me/fu0833",
  "https://t.me/mal1567",
  "https://t.me/lvy858"
];

export class GlobalCounter {
  constructor(ctx, env) {
    this.ctx = ctx;
  }

  async fetch(request) {
    if (request.method !== "GET") {
      return new Response("Method Not Allowed", {
        status: 405
      });
    }

    try {
      const link = await this.ctx.storage.transaction(
        async (txn) => {
          const counter = (await txn.get("counter")) ?? 0;

          const index = counter % TELEGRAM_LINKS.length;
          const selectedLink = TELEGRAM_LINKS[index];

          await txn.put(
            "counter",
            (counter + 1) % TELEGRAM_LINKS.length
          );

          return selectedLink;
        }
      );

      return new Response(null, {
        status: 302,
        headers: {
          "Location": link,
          "Cache-Control": "no-store"
        }
      });

    } catch (error) {
      return new Response(
        "Worker Error: " + error.message,
        { status: 500 }
      );
    }
  }
}

export default {
  async fetch(request, env) {
    const id = env.LINK_COUNTER.idFromName("global");
    const counter = env.LINK_COUNTER.get(id);

    return counter.fetch(request);
  }
};
