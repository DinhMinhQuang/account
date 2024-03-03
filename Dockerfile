FROM node:20
FROM m1nhquang/rabbitmq-delayed:tagname

ENV NODE_ENV=production

RUN mkdir /app
WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

CMD ["npm", "start"]
