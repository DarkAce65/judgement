# Client builder stage
FROM node:15.5.0 as client_builder

WORKDIR /client
EXPOSE 3000

COPY ./client/package.json ./client/yarn.lock ./
RUN yarn

COPY ./client .
RUN yarn build

# nginx container
FROM nginx

EXPOSE 80

COPY ./proxy/templates /etc/nginx/templates
COPY --from=client_builder /client/build /usr/share/nginx/html
