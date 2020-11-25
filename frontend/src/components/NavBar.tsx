import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useMeQuery } from "../generated/graphql";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery();
  let body = null;
  if (fetching) {
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href={"/login"}>
          <Link mr={2} color={"white"}>
            Login
          </Link>
        </NextLink>
        <NextLink href={"/register"}>
          <Link color={"white"}>Register</Link>
        </NextLink>
      </>
    );
  } else {
    console.log(data);
    body = (
      <Flex>
        <Box mr={4}>{data.me.username}</Box>
        <Button variant="link">Logout</Button>
      </Flex>
    );
  }
  return (
    <Flex bg="cyan.600" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
