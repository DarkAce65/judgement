# Client builder stage
FROM node:15.5.0 as client_builder

WORKDIR /client

COPY ./client/package.json ./client/yarn.lock ./
RUN yarn

ARG REACT_APP_API_HOST
ARG REACT_APP_API_ROOT
ENV REACT_APP_API_HOST=$REACT_APP_API_HOST \
  REACT_APP_API_ROOT=$REACT_APP_API_ROOT

COPY ./client .
RUN yarn build

# nginx container
FROM nginx

EXPOSE 80

COPY ./proxy/templates /etc/nginx/templates
COPY --from=client_builder /client/build /usr/share/nginx/html
