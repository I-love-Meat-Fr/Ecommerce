# MongoDB – local development

This project uses MongoDB via the `MongoDB.Driver` NuGet package. A local
instance is brought up with Docker Compose.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker
  Engine on Linux). On Windows, make sure WSL2 backend is enabled.

## One-time setup

```powershell
# from the repo root
Copy-Item .env.example .env       # tweak values if you want
docker compose up -d              # starts mongo on :27017 + mongo-express on :8081
```

| Service       | URL                                   | Default credentials |
| ------------- | ------------------------------------- | ------------------- |
| MongoDB       | `mongodb://localhost:27017`           | `admin` / `admin123` |
| mongo-express | http://localhost:8081                 | `admin` / `admin123` |

The connection string Mongo uses (auth-db `admin`) is:

```
mongodb://admin:admin123@localhost:27017/?authSource=admin
```

Update `api/appsettings.Development.json` to match once you set a password via
the `.env` file. The default in `appsettings.json` is the un-authenticated
`mongodb://localhost:27017` which works out-of-the-box if you remove the
`MONGO_INITDB_ROOT_USERNAME/PASSWORD` lines from `docker-compose.yml`.

## Useful commands

```powershell
docker compose ps                # check status
docker compose logs -f mongo     # tail mongo logs
docker compose down              # stop containers, KEEP data volume
docker compose down -v           # stop containers, DELETE data volume (reset)
```

## What the API does on startup

`api/Program.cs` calls `MongoStartup.InitializeAsync` which:

1. Creates the collections' indexes idempotently:
   - `users.email` (unique)
   - `products.category + name`, `products.variants.sku` (sparse)
   - `orders.userId + createdAt desc`, `orders.status`
2. Seeds the `products` collection with **6 sample products**
   (iPhones, Galaxy, MacBook, Sony XM5, MX Master, Apple Watch) — only when the
   collection is empty, so restarts are safe.
3. Seeds the `users` collection with **4 sample users** (1 admin + 3 customers)
   with stable placeholder password hashes — only when empty.
4. Seeds the `orders` collection with **5 sample orders** that reference real
   users and real product variants — only when empty.

These tasks run on a background `Task.Run(...)` so the HTTP listener starts
immediately even if Mongo is briefly unreachable.

## Verifying

```powershell
# 1. Health check (returns 200 / "Healthy" when Mongo is up)
curl http://localhost:5126/health

# 2. Sample products via API
curl http://localhost:5126/api/products

# 3. Filter by category
curl "http://localhost:5126/api/products?category=phones"

# 4. Or open Swagger
start http://localhost:5126/swagger
```

## Resetting the database

If the seeded data is stale or you just want a clean slate:

```powershell
docker compose down -v
docker compose up -d
# then start the API again
```
