# Fullstack Poker Coding Exercise

A complete Texas Hold'em poker application built with FastAPI backend and Next.js frontend, containerized with Docker Compose.

## Architecture

- **Backend**: FastAPI with Poetry, PostgreSQL, pokerkit for hand validation
- **Frontend**: Next.js with TypeScript, shadcn/ui components, Zustand state management
- **Database**: PostgreSQL with raw SQL queries (no ORM)
- **Containerization**: Docker Compose for development environment

## Quick Start

1. **Start the application**:
   ```bash
   docker compose up -d
   ```

2. **Visit the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Database: localhost:5432

3. **Smoke test**:
   - Open http://localhost:3000 in your browser
   - Click "Start Hand" to begin a new poker hand
   - Make actions (bet, fold, etc.) to test the game engine
   - Check "Hand History" to see completed hands

## API Endpoints

### Hands API

- `GET /api/hands?limit=50&offset=0` - List hands with pagination
- `GET /api/hands/{id}` - Get specific hand details
- `POST /api/hands` - Create and settle a new hand

### Example Hand Creation

```bash
curl -X POST http://localhost:8000/api/hands \
  -H "Content-Type: application/json" \
  -d '{
    "bb_size": 40,
    "seats": [
      {"seat": 0, "name": "Player0", "starting_stack": 1000, "role": "BTN"},
      {"seat": 1, "name": "Player1", "starting_stack": 1000, "role": "SB"},
      {"seat": 2, "name": "Player2", "starting_stack": 1000, "role": "BB"},
      {"seat": 3, "name": "Player3", "starting_stack": 1000, "role": "UTG"},
      {"seat": 4, "name": "Player4", "starting_stack": 1000, "role": "MP"},
      {"seat": 5, "name": "Player5", "starting_stack": 1000, "role": "CO"}
    ],
    "hole_cards": {
      "0": "As Ks",
      "1": "Qd Jd",
      "2": "Tc 9c",
      "3": "8h 7h",
      "4": "6s 5s",
      "5": "4d 3d"
    },
    "board": {
      "flop": "Ac Kh Qc",
      "turn": "Js",
      "river": "Td"
    },
    "actions": [
      {"seat": 3, "street": "preflop", "type": "r", "amount": 120},
      {"seat": 4, "street": "preflop", "type": "f", "amount": 0},
      {"seat": 5, "street": "preflop", "type": "f", "amount": 0},
      {"seat": 0, "street": "preflop", "type": "f", "amount": 0},
      {"seat": 1, "street": "preflop", "type": "f", "amount": 0},
      {"seat": 2, "street": "preflop", "type": "c", "amount": 80}
    ]
  }'
```

## Features

### Backend
- ✅ FastAPI with async/await support
- ✅ PostgreSQL database with migrations
- ✅ Hand validation (6 players, roles, actions)
- ✅ Card consistency validation
- ✅ pokerkit integration for hand settlement
- ✅ Comprehensive error handling
- ✅ Pytest test suite

### Frontend
- ✅ Next.js 14 with App Router
- ✅ TypeScript with strict mode
- ✅ shadcn/ui component library
- ✅ Zustand state management
- ✅ Responsive three-panel layout
- ✅ Game engine with action validation
- ✅ Hand history with refresh functionality

### Game Engine
- ✅ Texas Hold'em rules implementation
- ✅ Action validation (fold, check, call, bet, raise, all-in)
- ✅ Street progression (preflop → flop → turn → river)
- ✅ Pot management and betting rounds
- ✅ Hand completion detection
- ✅ Short line generation for hand summaries

## Development

### Running Tests

**Backend tests**:
```bash
docker compose exec backend python -m pytest tests/ -v
```

**Frontend tests**:
```bash
docker compose exec frontend npm test
```

### Database Migrations

Migrations are automatically run when the backend container starts. To run manually:

```bash
docker compose exec backend ./scripts/migrate.sh
```

### Code Quality

- **Python**: ruff for linting, mypy for type checking
- **TypeScript**: ESLint + Prettier
- **Formatting**: Automatic formatting on save

## Project Structure

```
poker-fullstack/
├── docker-compose.yml          # Container orchestration
├── README.md                   # This file
├── backend/                    # FastAPI backend
│   ├── pyproject.toml         # Poetry dependencies
│   ├── Dockerfile             # Backend container
│   ├── app/
│   │   ├── main.py            # FastAPI app
│   │   ├── api/hands.py       # Hand endpoints
│   │   ├── domain/            # Data models
│   │   ├── services/          # Business logic
│   │   ├── repository/        # Database layer
│   │   └── tests/             # Test suite
│   ├── migrations/            # SQL migrations
│   └── scripts/migrate.sh    # Migration runner
└── frontend/                  # Next.js frontend
    ├── package.json          # Dependencies
    ├── Dockerfile            # Frontend container
    ├── src/
    │   ├── app/              # Next.js App Router
    │   ├── components/       # React components
    │   ├── lib/game/         # Game engine
    │   └── store/            # Zustand stores
    └── tests/                # E2E tests
```

## Hand Validation Rules

The backend validates hands according to Texas Hold'em rules:

1. **Player Count**: Exactly 6 players required
2. **Roles**: Must have BTN, SB, BB, UTG, MP, CO
3. **Blinds**: SB = BB/2, BB = specified size
4. **Actions**: Valid action types (f, x, c, b, r, allin)
5. **Cards**: No duplicate cards across hole cards and board
6. **Streets**: Actions must be in correct street order

## Error Handling

The API returns detailed error messages for validation failures:

- `422 Unprocessable Entity`: Validation errors with specific details
- `404 Not Found`: Hand not found
- `500 Internal Server Error`: Server-side errors

Example error response:
```json
{
  "detail": "Player 3 cannot check when facing bet"
}
```

## Performance

- **Backend**: Async FastAPI with connection pooling
- **Frontend**: Next.js with static generation where possible
- **Database**: Indexed queries for hand history
- **Caching**: Browser caching for static assets

## Security

- Input validation on all API endpoints
- SQL injection prevention with parameterized queries
- CORS configuration for frontend-backend communication
- Environment variable configuration for sensitive data

