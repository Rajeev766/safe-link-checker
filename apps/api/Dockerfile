FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/safe-link-checker/package.json ./packages/safe-link-checker/
COPY apps/api/package.json ./apps/api/

RUN npm install

COPY packages/safe-link-checker ./packages/safe-link-checker
COPY apps/api ./apps/api

# Build SDK
RUN npm run build --workspace=safe-link-checker

# Generate Prisma
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npx prisma db push

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
