import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from "express";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  const app = express();
  app.get("/", async (_, res) => {
    const posts = await orm.em.find(Post, {});
    res.send(posts);
  });
  app.listen(4000, () => {
    console.log("Server up on port 4000");
  });
};

main().catch((err) => {
  console.log(err);
});
