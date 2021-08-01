import { ApolloServer } from "apollo-server";
import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { addResolversToSchema } from "@graphql-tools/schema";
import { Resolvers as BaseResolvers } from "./generated/graphql";
import {
  createCalendlyClient,
  ICalendlyClient,
} from "./utils/createCalendlyClient";
import { formatError } from "./utils/formatError";

type WithDefaultResolvers<T extends BaseResolvers> = {
  Query: T["Query"];
  Mutation: T["Mutation"];
  ScheduledEvent: {
    invitees: T["ScheduledEvent"]["invitees"];
  };
};
type Resolvers = WithDefaultResolvers<
  BaseResolvers<{ calendly: ICalendlyClient }>
>;

const resolvers: Resolvers = {
  ScheduledEvent: {
    invitees: ({ uri }, params, { calendly }) => {
      return calendly.get(`${uri}/invitees`, params);
    },
  },
  Query: {
    usersMe: async (_obj, _args, { calendly }) => {
      return calendly.get("/users/me");
    },
    user: async (_obj, { uuid }, { calendly }) => {
      return calendly.get(`/users/${uuid}`);
    },
    eventType: async (_obj, { uuid }, { calendly }) => {
      return calendly.get(`/event_types/${uuid}`);
    },
    eventTypes: async (_obj, params, { calendly }) => {
      return calendly.get(`/event_types`, params);
    },
    organizationInvitation: async (
      _obj,
      { organization_uuid, invitation_uuid },
      { calendly }
    ) => {
      return calendly.get(
        `/organizations/${organization_uuid}/invitations/${invitation_uuid}`
      );
    },
    organizationInvitations: async (
      _obj,
      { organization_uuid, ...params },
      { calendly }
    ) => {
      return calendly.get(
        `/organizations/${organization_uuid}/invitations`,
        params
      );
    },
    organizationMembership: async (_obj, { uuid }, { calendly }) => {
      return calendly.get(`/organization_memberships/${uuid}`);
    },
    organizationMemberships: async (_obj, params, { calendly }) => {
      return calendly.get(`/organization_memberships`, params);
    },
    scheduledEvent: async (_obj, { uuid }, { calendly }) => {
      return calendly.get(`/scheduled_events/${uuid}`);
    },
    scheduledEvents: async (_obj, params, { calendly }) => {
      return calendly.get(`/scheduled_events`, params);
    },
    scheduledEventInvitee: async (
      _obj,
      { event_uuid, invitee_uuid },
      { calendly }
    ) => {
      return calendly.get(
        `/scheduled_events/${event_uuid}/invitees/${invitee_uuid}`
      );
    },
    scheduledEventInvitees: async (
      _obj,
      { event_uuid, ...params },
      { calendly }
    ) => {
      return calendly.get(`/scheduled_events/${event_uuid}/invitees`, params);
    },
    webhookSubscription: async (_obj, { uuid }, { calendly }) => {
      return calendly.get(`/webhook_subscriptions/${uuid}`);
    },
    webhookSubscriptions: async (_obj, params, { calendly }) => {
      return calendly.get(`/webhook_subscriptions`, params);
    },
  },
  Mutation: {
    requestInviteeDataDeletion: async (_obj, params, { calendly }) => {
      return calendly.post(`/data_compliance/deletion/invitees`, params);
    },
    createWebhookSubscription: async (_obj, { input }, { calendly }) => {
      return calendly.post(`/scheduling_links`, input);
    },
    createOrganizationInvitation: async (
      _obj,
      { input, organization_uuid },
      { calendly }
    ) => {
      return calendly.post(`/organizations/${organization_uuid}`, input);
    },
    createSchedulingLink: async (_obj, { input }, { calendly }) => {
      return calendly.post(`/scheduling_links`, input);
    },
    deleteWebhookSubscription: async (
      _obj,
      { webhook_subscription_uuid },
      { calendly }
    ) => {
      await calendly.delete(
        `/webhook_subscriptions/${webhook_subscription_uuid}`
      );

      return true;
    },
    removeUserFromOrganization: async (
      _obj,
      { organization_membership_uuid },
      { calendly }
    ) => {
      await calendly.delete(
        `/organization_memberships/${organization_membership_uuid}`
      );

      return true;
    },
    revokeOrganizationInvitation: async (
      _obj,
      { invitation_uuid, organization_uuid },
      { calendly }
    ) => {
      await calendly.delete(
        `/organizations/${organization_uuid}/invitations/${invitation_uuid}`
      );

      return true;
    },
  },
};

const schema = loadSchemaSync("./schema.graphql", {
  loaders: [new GraphQLFileLoader()],
});

const schemaWithResolvers = addResolversToSchema({
  schema,
  resolvers,
});

const server = new ApolloServer({
  schema: schemaWithResolvers,
  context: ({ req }) => {
    const token = (req.headers.authorization || "").replace("Bearer ", "");

    const calendly = createCalendlyClient({ token });

    return { calendly };
  },
  introspection: true,
  formatError,
});

// The `listen` method launches a web server.
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
