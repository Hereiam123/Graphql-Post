import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  const app = express();
  const apolloSever = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: () => ({
      em: orm.em,
    }),
  });
  /*app.get("/", async (_, res) => {
    const posts = await orm.em.find(Post, {});
    res.send(posts);
  });*/
  apolloSever.applyMiddleware({ app });
  app.listen(4000, () => {
    console.log("Server up on port 4000");
  });
};

main().catch((err) => {
  console.log(err);
});
