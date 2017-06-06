FROM node:7.8
MAINTAINER Francisco Preller <francisco.preller@gmail.com>

## Setup userspace
RUN rm /home/app -rf
RUN mkdir -p /home/app/
WORKDIR /home/app

# Install app dependencies
RUN npm install -g forever@0.14.2 gulp

# Load Package JSON
ADD ./package.json /home/app/package.json
ADD ./yarn.lock /home/app/yarn.lock
RUN yarn install

# Load the source into the docker image
ADD . /home/app

# Run the init
EXPOSE 4000
EXPOSE 9001
ENTRYPOINT ["/usr/bin/node"]
CMD ["./ranvier", "-v", "--save=10", "--respawn=10"]