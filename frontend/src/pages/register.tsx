import React from "react";
import { Formik, Form } from "formik";
import { Box, Button } from "@chakra-ui/react";
import Wrapper from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useMutation } from "urql";

interface RegisterProps {}

const Register: React.FC<RegisterProps> = ({}) => {
  const [registerResult, register] = useMutation(REGISTER_MUTATION);
  return (
    <Wrapper variant={"small"}>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values) => {
          const response = await register(values);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

const REGISTER_MUTATION = `
  mutation Register($username: String!, $password: String!) {
    register (options: {username: $username, password: $password}) {
        user{
        id
        username
        }
        errors{
                message
        }
    }
  }
`;

export default Register;
