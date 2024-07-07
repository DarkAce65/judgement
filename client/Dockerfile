FROM node:22

USER node
WORKDIR /client
EXPOSE 3000

COPY --chown=node:node package.json yarn.lock ./
RUN yarn

COPY --chown=node:node . .
CMD ["yarn", "dev"]
