# Medusa Marketplace

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

2. Fill in database connection string for backend app

`cd apps/backend`

`cp .env.template .env`

3. Start backend

`nx serve backend`

4. Start admin

`cd apps/admin`

`yarn start`

5. Start storefront

`nx serve storefront`

----

If the above commands run successfully,

Backend will be running at port 9000

Admin dashboard will be running at port 4200

Storefront will be running at port 3000

----

# Reference

Tutorial

Part 1: https://medusajs.com/blog/medusa-extender

Part 2: https://medusajs.com/blog/medusa-open-source-marketplace-part-2-make-orders-vendor-specific

Part 3: https://medusajs.com/blog/online-marketplace-tutorial-part-3-implement-user-management-and-permissions

https://medusajs.com/



