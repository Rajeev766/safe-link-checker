FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/safe-link-checker/package.json ./packages/safe-link-checker/
COPY apps/dashboard/package.json ./apps/dashboard/

RUN npm install

COPY packages/safe-link-checker ./packages/safe-link-checker
COPY apps/dashboard ./apps/dashboard

RUN npm run build --workspace=safe-link-checker

WORKDIR /app/apps/dashboard
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
