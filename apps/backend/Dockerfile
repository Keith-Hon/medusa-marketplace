FROM node:17.1.0 as builder

ARG ADMIN_CORS

ENV ADMIN_CORS $ADMIN_CORS

WORKDIR /app/medusa

COPY . . 

RUN rm -rf node_modules

RUN apt-get update

RUN apt-get install -y python

RUN yarn install

RUN yarn build


FROM node:17.1.0

WORKDIR /app/medusa

RUN mkdir dist

COPY package.json ./ 

COPY yarn.lock ./ 

COPY develop.sh .

COPY .env .

COPY medusa-config.js .

RUN apt-get update

RUN apt-get install -y python
# RUN apk add --no-cache python3

RUN yarn global add "@medusajs/medusa-cli"

RUN yarn install --only=production

COPY --from=builder /app/medusa/dist ./dist

EXPOSE 9000

ENTRYPOINT ["node", "dist/src/main.js"]