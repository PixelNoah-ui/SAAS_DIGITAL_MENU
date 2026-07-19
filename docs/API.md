# API Documentation

## Base URL

- Development: http://localhost:8000
- Production: set through the deployed backend host

## Authentication

### Admin authentication

- JWT is issued on successful login and stored in an HTTP-only cookie named `token`
- Protected routes require the cookie and use the `protect` middleware
- Role-based restrictions are enforced by `restrictTo("ADMIN", "MANAGER")`

### Customer session authentication

- Customer table sessions use an HTTP-only cookie named `session_token`
- Session-protected routes use the `requireSession` middleware

## Endpoints

### Authentication

| Method | URL                            | Auth                   | Description                      | Request                                             | Response                           |
| ------ | ------------------------------ | ---------------------- | -------------------------------- | --------------------------------------------------- | ---------------------------------- |
| POST   | /api/auth/signup               | Public                 | Create a new admin/staff account | `fullName`, `email`, `password`, `confirmPassword`  | 201 with success message           |
| POST   | /api/auth/login                | Public                 | Authenticate an admin user       | `email`, `password`                                 | 200 with token and success message |
| POST   | /api/auth/logout               | Public                 | Clear auth cookie                | None                                                | 200 success                        |
| POST   | /api/auth/forgotPassword       | Public                 | Send reset email                 | `email`                                             | 200 success                        |
| PATCH  | /api/auth/resetPassword/:token | Public                 | Reset password                   | `newPassword`, `confirmPassword`                    | 200 success                        |
| PATCH  | /api/auth/updatePassword       | Admin/manager required | Change current password          | `currentPassword`, `newPassword`, `confirmPassword` | 200 success                        |
| GET    | /api/auth/me                   | Admin/manager required | Get current user profile         | None                                                | User details                       |

### Menu

| Method | URL                           | Auth                   | Description                                            | Request                                                                                | Response                  |
| ------ | ----------------------------- | ---------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------- |
| GET    | /api/menu-items               | Public                 | Get public menu items with search, pagination, filters | `search`, `collections`, `price_min`, `price_max`, `sort`, `page`                      | `menuItems`, `totalPages` |
| POST   | /api/menu-items               | Admin/manager required | Create a menu item                                     | `name`, `categoryType`, `description`, `price`, `preparationTime`, `image`, `imageUrl` | Created menu item         |
| GET    | /api/menu-items/getAdminMenus | Public                 | Admin menu index payload used by admin UI              | `q`, `categoryType`, `page`                                                            | Menu list and pagination  |
| GET    | /api/menu-items/:id           | Public                 | Get a single menu item                                 | `id` in URL                                                                            | Menu item                 |
| PATCH  | /api/menu-items/:id           | Admin/manager required | Update a menu item                                     | Partial menu item fields                                                               | Updated menu item         |
| DELETE | /api/menu-items/:id           | Admin/manager required | Delete a menu item                                     | `id` in URL                                                                            | 204                       |

### Orders

| Method | URL                      | Auth                                | Description                                  | Request                                          | Response                  |
| ------ | ------------------------ | ----------------------------------- | -------------------------------------------- | ------------------------------------------------ | ------------------------- |
| POST   | /api/orders              | Session-based public order creation | Create an order for the active table session | `tableId`, `items`, `sessionToken`               | Created order and session |
| GET    | /api/orders/session      | Session required                    | Get orders for the current table session     | `page`, `status`, `date_from`, `date_to`, `sort` | Orders and pagination     |
| GET    | /api/orders              | Admin/manager required              | Get all orders                               | `page`, `status`                                 | Orders and pagination     |
| GET    | /api/orders/adminOrders  | Admin/manager required              | Get admin-focused order list                 | `q`, `status`, `page`                            | Orders and pagination     |
| GET    | /api/orders/unread-count | Admin/manager required              | Get unread order count                       | None                                             | `{ count }`               |
| PATCH  | /api/orders/mark-read    | Admin/manager required              | Mark all orders as read                      | None                                             | Success                   |
| GET    | /api/orders/:id          | Admin/manager required              | Get a single order                           | `id` in URL                                      | Order details             |
| PATCH  | /api/orders/:id          | Admin/manager required              | Update order status                          | `status`                                         | Updated order             |
| DELETE | /api/orders/:id          | Admin/manager required              | Delete an order                              | `id` in URL                                      | 204                       |

### Sessions

| Method | URL              | Auth             | Description                     | Request   | Response                   |
| ------ | ---------------- | ---------------- | ------------------------------- | --------- | -------------------------- |
| POST   | /api/sessions    | Public           | Create or reuse a table session | `tableId` | Created or updated session |
| GET    | /api/sessions/me | Session required | Get current active session      | None      | Session details            |
| DELETE | /api/sessions    | Session required | Close current session           | None      | Success                    |

### Tables

| Method | URL              | Auth                   | Description                            | Request                             | Response                   |
| ------ | ---------------- | ---------------------- | -------------------------------------- | ----------------------------------- | -------------------------- |
| POST   | /api/tables/scan | Public                 | Resolve a table by QR token            | `qrToken`                           | Table details              |
| GET    | /api/tables      | Admin/manager required | Get tables with pagination and filters | `q`, `status`, `page`               | Tables and pagination      |
| POST   | /api/tables      | Admin/manager required | Create a table and QR payload          | `tableNumber`, `capacity`           | Table details and menu URL |
| GET    | /api/tables/:id  | Admin/manager required | Get a single table                     | `id` in URL                         | Table details              |
| PATCH  | /api/tables/:id  | Admin/manager required | Update table                           | `tableNumber`, `capacity`, `status` | Updated table              |
| DELETE | /api/tables/:id  | Admin/manager required | Delete a table                         | `id` in URL                         | Success                    |

### Managers

| Method | URL               | Auth           | Description              | Request                                        | Response                 |
| ------ | ----------------- | -------------- | ------------------------ | ---------------------------------------------- | ------------------------ |
| GET    | /api/managers     | Admin required | List managers / staff    | `q`, `role`, `page`                            | Paginated staff accounts |
| POST   | /api/managers     | Admin required | Create a manager account | `name`, `email`, `password`, `confirmPassword` | Created manager          |
| GET    | /api/managers/:id | Admin required | Get one manager          | `id` in URL                                    | Manager record           |
| PATCH  | /api/managers/:id | Admin required | Update a manager         | `name`, `email`, `password`, `confirmPassword` | Updated manager          |
| DELETE | /api/managers/:id | Admin required | Delete a manager         | `id` in URL                                    | 204                      |

### Restaurant info

| Method | URL                  | Auth                   | Description               | Request                                        | Response                |
| ------ | -------------------- | ---------------------- | ------------------------- | ---------------------------------------------- | ----------------------- |
| GET    | /api/restaurant-info | Public                 | Get restaurant profile    | None                                           | Restaurant info         |
| PATCH  | /api/restaurant-info | Admin/manager required | Update restaurant profile | `name`, `phone`, `address`, `telegramUsername` | Updated restaurant info |

### Dashboard

| Method | URL            | Auth                   | Description           | Request                               | Response                                           |
| ------ | -------------- | ---------------------- | --------------------- | ------------------------------------- | -------------------------------------------------- |
| GET    | /api/dashboard | Admin/manager required | Get dashboard metrics | `period` (`7d`, `30d`, `365d`, `all`) | Stats, order growth, revenue growth, recent orders |

## Error Conventions

Common error responses use:

- `400` for validation issues
- `401` for authentication/session failures
- `403` for authorization failures
- `404` for missing resources
- `409` for duplicate values such as email conflicts
- `429` for order rate limit violations

## Notes

- The API uses JSON responses with a `status` or `success` field.
- Some admin endpoints return a `data` envelope while others return nested resource payloads.
- The current implementation does not expose a documented payment or checkout API.
