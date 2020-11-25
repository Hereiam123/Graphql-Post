import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    //No user logged in
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 3) {
      return {
        errors: [
          { field: "username", message: "length needs to be greater than 5" },
        ],
      };
    }
    if (options.password.length <= 3) {
      return {
        errors: [
          { field: "password", message: "length needs to be greater than 5" },
        ],
      };
    }
    const hashPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username.toLowerCase(),
      password: hashPassword,
    });
    //let user;
    try {
      /*const [result] = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          password: hashPassword,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");
      user = result;*/
      await em.persistAndFlush(user);
    } catch (e) {
      if (e.code === "23505" || e.detail.includes("already exists")) {
        return {
          errors: [{ field: "username", message: "username already in use" }],
        };
      }
    }
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {
      username: options.username.toLowerCase(),
    });

    if (!user) {
      return {
        errors: [{ field: "username", message: "user does not exist" }],
      };
    }

    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [{ field: "password", message: "invalid login" }],
      };
    }

    //Store user id session
    //and sets cookie, keeping logged in
    req.session.userId = user.id;

    return { user };
  }
}
