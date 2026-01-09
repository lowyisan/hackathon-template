# API Contract

Base URL: `/api`

Authentication: Bearer Token (JWT) required for all endpoints except `/auth/*`.

## Authentication

### Register
Create a new user and company account.

- **URL:** `/auth/register`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123",
    "companyName": "Acme Corp"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1..."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Password too weak (min 8 chars, 1 letter, 1 number).
  - `409 Conflict`: Email or Company Name already taken.
  - `422 Unprocessable Entity`: Missing fields.

### Login
Authenticate an existing user.

- **URL:** `/auth/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1..."
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Invalid credentials.

---

## Company & Balance

### Get Balances
Retrieve the current financial and carbon balances for the authenticated user's company.

- **URL:** `/me/balances`
- **Method:** `GET`
- **Success Response (200):**
  ```json
  {
    "companyId": 1,
    "carbonBalance": 100.0,
    "cashBalance": 5000.0
  }
  ```

---

## Trading Requests

### List My Requests (Outgoing)
Get a list of requests created by the current company.

- **URL:** `/me/requests`
- **Method:** `GET`
- **Success Response (200):**
  ```json
  [
    {
      "id": 1,
      "requestDate": "2023-10-27T10:00:00",
      "requestType": "BUY",
      "carbonUnitPrice": 50.0,
      "carbonQuantity": 10.0,
      "requestReason": "Offset emissions",
      "status": "PENDING",
      "requestorCompanyId": 1,
      "targetCompanyId": 2
    }
  ]
  ```

### List Requests Received (Incoming)
Get a list of pending requests targeting the current company.

- **URL:** `/me/requests-received`
- **Method:** `GET`
- **Success Response (200):**
  ```json
  [
    {
      "id": 2,
      "requestDate": "2023-10-28T14:30:00",
      "requestType": "SELL",
      "carbonUnitPrice": 45.0,
      "carbonQuantity": 20.0,
      "requestReason": "Surplus inventory",
      "status": "PENDING",
      "requestorCompanyId": 3,
      "targetCompanyId": 1
    }
  ]
  ```

### Create Request
Propose a new trade.

- **URL:** `/me/requests`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "targetCompanyId": 2,
    "requestType": "BUY",
    "carbonUnitPrice": 50.0,
    "carbonQuantity": 10.0,
    "requestReason": "Need carbon credits"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "id": 5,
    "status": "PENDING",
    ...
  }
  ```

### Update Request
Edit an existing pending request created by your company.

- **URL:** `/me/requests/<id>`
- **Method:** `PUT`
- **Body:** (Any subset of fields)
  ```json
  {
    "carbonUnitPrice": 55.0
  }
  ```
- **Success Response (200):** returns updated request object.

### Delete Request
Cancel a pending request.

- **URL:** `/me/requests/<id>`
- **Method:** `DELETE`
- **Success Response (204):** No Content.

### Decide on Request
Accept or Reject an incoming request.

- **URL:** `/me/requests-received/<id>/decision`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "decision": "ACCEPT" 
  }
  ```
  *(Value can be "ACCEPT" or "REJECT")*

- **Success Response (200):**
  ```json
  {
    "status": "ACCEPTED"
  }
  ```
- **Error Responses:**
  - `422 Unprocessable Entity`: Insufficient funds or carbon balance.

---

## Alerts

### Get Overdue Alerts
Get a list of IDs for pending received requests that are older than 7 days.

- **URL:** `/me/alerts`
- **Method:** `GET`
- **Success Response (200):**
  ```json
  [ 5, 12 ]
  ```
