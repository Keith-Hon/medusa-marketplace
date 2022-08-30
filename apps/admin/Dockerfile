FROM node:17.1.0 as builder

WORKDIR /app/admin

ARG GATSBY_MEDUSA_BACKEND_URL

ENV GATSBY_MEDUSA_BACKEND_URL ${GATSBY_MEDUSA_BACKEND_URL}

COPY . .

RUN rm -rf node_modules

RUN apt-get update

RUN yarn add sharp  

RUN yarn global add gatsby-cli

RUN yarn install

RUN gatsby build

FROM nginx

EXPOSE 80 

COPY --from=builder /app/admin/public /usr/share/nginx/html

ENTRYPOINT ["nginx", "-g", "daemon off;"]