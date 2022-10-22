FROM node:18

USER node
WORKDIR /client
EXPOSE 3000

COPY package.json yarn.lock ./
RUN yarn

COPY . .
CMD ["yarn", "dev"]
