# Calendgraph

An [Apollo GraphQL server](https://www.apollographql.com/docs/apollo-server/) built on top of [Calendly's V2 REST API](https://developer.calendly.com/).

Try it out at https://calendgraph.herokuapp.com

<a href="https://heroku.com/deploy?template=https://github.com/tcampb/calendgraph">
  <img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy">
</a>

### Getting Started

```bash
# install dependencies
npm install
# build application
npm run build
# start application
npm start
```

Once the app is running, visit http://localhost:4000 to start testing Calendgraph:

```graphql
# Add an Authorization header with "Bearer YOUR_CALENDLY_API_TOKEN" before running the query below
{
  usersMe {
    resource {
      name
      email
    }
  }
}
```
