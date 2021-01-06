FROM node:15.5.0

WORKDIR /client
EXPOSE 3000

COPY package.json yarn.lock ./
RUN yarn

COPY . .
CMD ["yarn", "start"]
