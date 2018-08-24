FROM node:6.14.4-alpine

RUN apk add --update-cache \
  gimp \
  make

WORKDIR /root

COPY gulpfile.js /root
COPY Makefile /root
COPY package.json /root

RUN npm install
CMD ["make"]
