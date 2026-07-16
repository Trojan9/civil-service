# Cinema Tickets

A ticket purchasing service for a cinema that validates requests, calculates payments, and reserves seats according to business rules.

## Prerequisites

- Node.js >= 20.9.0
- npm

## Getting Started

```bash
cd cinema-tickets-javascript
npm install
```

## Running the Demo

```bash
node demo.js
```

Example output:

```
=== Valid Purchases ===

PASS: 1 Adult ticket (£25, 1 seat)
PASS: 2 Adults + 3 Children (£95, 5 seats)
PASS: 2 Adults + 2 Children + 1 Infant (£80, 4 seats)
PASS: 25 Adult tickets - max allowed (£625, 25 seats)

=== Invalid Purchases ===

REJECTED: Account ID of 0 --> Account ID must be a positive integer
REJECTED: Negative account ID --> Account ID must be a positive integer
REJECTED: No ticket requests --> At least one ticket request is required
REJECTED: 26 tickets - exceeds max --> Cannot purchase more than 25 tickets at a time
REJECTED: Child without Adult --> Child and Infant tickets cannot be purchased without an Adult ticket
REJECTED: Infant without Adult --> Child and Infant tickets cannot be purchased without an Adult ticket
REJECTED: More Infants than Adults --> Number of Infant tickets cannot exceed the number of Adult tickets
REJECTED: Plain object instead of TicketTypeRequest --> All arguments must be instances of TicketTypeRequest
```

## Running Tests

```bash
npm test
```

## Linting & Formatting

```bash
npm run lint          # check for lint errors
npm run lint:fix      # auto-fix lint errors
npm run format:check  # check formatting
npm run format        # auto-fix formatting
```

## Security Audit

```bash
npm run audit:security
```

## Project Structure

```
cinema-tickets-javascript/
├── src/
│   ├── pairtest/
│   │   ├── TicketService.js              # Main implementation
│   │   └── lib/
│   │       ├── TicketTypeRequest.js       # Immutable ticket request object
│   │       └── InvalidPurchaseException.js
│   └── thirdparty/                        # External services (not modified)
│       ├── paymentgateway/
│       │   └── TicketPaymentService.js
│       └── seatbooking/
│           └── SeatReservationService.js
├── test/
│   └── TicketService.test.js             # 41 test cases
├── eslint.config.js
├── .prettierrc
└── package.json
```

## Business Rules

| Ticket Type | Price | Seat Allocated |
|-------------|-------|----------------|
| ADULT       | £25   | Yes            |
| CHILD       | £15   | Yes            |
| INFANT      | £0    | No (sits on Adult's lap) |

- Maximum 25 tickets per purchase
- Child and Infant tickets require at least one Adult ticket
- Each Infant must have a corresponding Adult (Infants cannot exceed Adults)
- All accounts with an ID greater than zero are valid

## Design Decisions

### Dependency Injection

`TicketService` accepts `TicketPaymentService` and `SeatReservationService` via its constructor with sensible defaults. This allows the third-party services to be mocked in tests without modifying any third-party code.

### Private Methods

All internal logic uses JavaScript private class methods (`#methodName`) to ensure only `purchaseTickets` is exposed as a public API, as specified in the interface contract.

### Validation Order

Validation follows a fail-fast approach in this order:

1. Account ID validation
2. Ticket request validation (type checking, quantity checks)
3. Business rule validation (Adult requirement, Infant-Adult ratio)

This ensures invalid requests are rejected early before any calculations or service calls are made.

### Infant-to-Adult Ratio

Since each Infant must sit on an Adult's lap, the service enforces that the number of Infant tickets cannot exceed the number of Adult tickets. This prevents scenarios where an Infant would have no Adult to sit with.

## CI/CD

GitHub Actions runs on every push to `main` and on pull requests:

- **Lint** - ESLint checks
- **Format Check** - Prettier formatting validation
- **Security Audit** - `npm audit` for dependency vulnerabilities
- **Tests** - Jest test suite (runs after lint and format pass)

Branch protection is enabled on `main` requiring all CI checks to pass before merging.
