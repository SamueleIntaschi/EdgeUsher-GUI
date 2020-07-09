FROM node:14.4.0 as build

WORKDIR '/app'

COPY package.json .
RUN npm install
COPY . .

RUN npm install -g @angular/cli

RUN ng build --configuration production --output-path=/dist

FROM nginx:alpine
COPY /nginx-custom.conf /etc/nginx/conf.d/default.conf
COPY --from=build /dist /usr/share/nginx/html
EXPOSE 8080
