FROM node:10

WORKDIR /usr/src/app

# Wild card for package.json & package-lock.json
# Seperate command for cp package.json so that it doesn't reinstall every source change
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

RUN npm run build

USER node

CMD ["npm", "start"]
