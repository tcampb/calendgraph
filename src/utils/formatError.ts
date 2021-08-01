import { ApolloError } from "apollo-server";
import { GraphQLError, GraphQLFormattedError } from "graphql";

type ErrorFormatter =
  | ((error: GraphQLError) => GraphQLFormattedError<Record<string, any>>)
  | undefined;

const parseCalendlyErrorMessage = (e: any) => {
  return e?.originalError?.response?.data?.message;
};

const parseCalendlyErrorDetails = (e: any) => {
  return e?.originalError?.response?.data?.details;
};

export const formatError: ErrorFormatter = (error) => {
  const e = new ApolloError(parseCalendlyErrorMessage(error) || error.message);
  e.extensions.errorDetails = parseCalendlyErrorDetails(error) || [];

  return e;
};
