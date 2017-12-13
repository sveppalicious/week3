FROM node
WORKDIR /server
RUN apt-get update
RUN apt-get install telnet
COPY package.json .
RUN npm install --silent
COPY . .
EXPOSE 8000
ENV NODE_PATH /server/
CMD ["./runserver.sh"]
