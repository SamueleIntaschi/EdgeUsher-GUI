FROM node:14.4.0

WORKDIR '/app'

COPY package.json .
RUN npm install
COPY . .
EXPOSE 4200
CMD ["/bin/sh", "-c", "envsubst '$${SERVER_URL},$${SERVER_PORT}' < src/assets/config.template.json > src/assets/config.json", "&&", "npm", "start"]
