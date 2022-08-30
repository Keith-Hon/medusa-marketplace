# MedusaMarketplace

Project status

- [x] Assigned store_id to Order, Product to make them store specific
- [ ] Create and process payment for an order with multiple merchants

----

1. Install workspace dependencies
`yarn install`

Steps to run the project

1. Install workspace dependencies

`yarn install`

2. Install dependencies for admin app

`cd apps/admin`

`yarn install`

2. Install dependencies for backend app

`cd apps/backend`

`cp .env.template .env`

`yarn install`

`yarn seed`

3. Start backend

`cd apps/backend`

`yarn start`

4. Start admin

`cd apps/admin`

`yarn start`

5. Start storefront

`yarn serve storefront`
