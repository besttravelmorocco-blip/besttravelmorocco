# API v2 Test Results

**Run:** 2026-06-06T03:34:54.328Z
**Method:** Direct DB query test (queries that back each API route)
**Note:** vercel dev edge/node function invocation failed locally due to network constraints; queries tested directly against Supabase.

## Route Query Tests

| Route | Rows | Status |
|-------|------|--------|
| GET /api/v2/seasons | 3 | ✅ pass |
| GET /api/v2/tours | 1 | ✅ pass |
| GET /api/v2/accommodations | 1 | ✅ pass |
| GET /api/v2/student/voyages | 1 | ✅ pass |
| GET /api/v2/student/departures | 0 | ✅ pass |
| GET /api/v2/calendar/:tour_id | 1 | ✅ pass |
| GET /api/v2/tours (nested) | 1 | ✅ pass |
| GET /api/v2/tours highlights | 1 | ✅ pass |
| GET /api/v2/tours faqs | 1 | ✅ pass |
| GET /api/v2/pricing tiers | 5 | ✅ pass |
| GET /api/v2/pricing overrides | 1 | ✅ pass |
| COUNT tours_v2 | 1 | ✅ pass |
| COUNT accommodations | 1 | ✅ pass |
| COUNT student_voyages | 1 | ✅ pass |
| COUNT student_departures | 1 | ✅ pass |
| COUNT booking_calendar | 1 | ✅ pass |

**Total:** 16 pass, 0 fail

## API Routes Inventory

### Tours
- `GET  /api/v2/tours` — list all (supports ?status=, ?type= filters)
- `POST /api/v2/tours` — create new tour
- `GET  /api/v2/tours/:id` — single tour with itinerary/highlights/faqs
- `PUT  /api/v2/tours/:id` — partial update
- `DEL  /api/v2/tours/:id` — delete
- `GET  /api/v2/tours/:id/itinerary` — day list
- `POST /api/v2/tours/:id/itinerary` — upsert day
- `DEL  /api/v2/tours/:id/itinerary` — clear all
- `GET  /api/v2/tours/:id/highlights` — list
- `POST /api/v2/tours/:id/highlights` — add one
- `PUT  /api/v2/tours/:id/highlights` — replace all (array)
- `DEL  /api/v2/tours/:id/highlights` — clear all
- `GET  /api/v2/tours/:id/faqs` — list
- `POST /api/v2/tours/:id/faqs` — add one
- `PUT  /api/v2/tours/:id/faqs` — replace all (array)
- `DEL  /api/v2/tours/:id/faqs` — clear all
- `GET  /api/v2/tours/:id/pricing` — overrides with season join
- `POST /api/v2/tours/:id/pricing` — upsert one override
- `PUT  /api/v2/tours/:id/pricing` — batch upsert
- `GET  /api/v2/tours/:id/price-calculate` — live calc (?tier=&date=&nights=&pax=)
- `GET  /api/v2/tours/:id/availability` — calendar (?year=&month=)

### Accommodations
- `GET  /api/v2/accommodations` — list active (?city=, ?category=)
- `POST /api/v2/accommodations` — create
- `GET  /api/v2/accommodations/:id` — single
- `PUT  /api/v2/accommodations/:id` — partial update
- `DEL  /api/v2/accommodations/:id` — soft delete (active=false)

### Seasons
- `GET  /api/v2/seasons` — list
- `POST /api/v2/seasons` — add one
- `PUT  /api/v2/seasons` — batch update (array)
- `DEL  /api/v2/seasons?id=` — delete by id

### Student
- `GET  /api/v2/student/voyages` — all SaS voyages
- `POST /api/v2/student/voyages` — upsert one
- `POST /api/v2/student/voyages-sync` — scrape semesteratsea.org
- `GET  /api/v2/student/departures` — list (?status=)
- `POST /api/v2/student/departures` — create departure
- `GET  /api/v2/student/departures/:id` — single
- `PUT  /api/v2/student/departures/:id` — partial update
- `DEL  /api/v2/student/departures/:id` — delete

### Calendar
- `GET  /api/v2/calendar/:tour_id` — calendar (?year=, ?month=)
- `POST /api/v2/calendar/:tour_id/block` — block a date
- `GET  /api/v2/calendar/:tour_id/:date` — single date entry
- `PUT  /api/v2/calendar/:tour_id/:date` — update/upsert date entry
- `DEL  /api/v2/calendar/:tour_id/:date` — remove date entry