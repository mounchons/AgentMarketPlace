# Tech Stack Auto-Detection Patterns

วิธีตรวจจับ tech stack จาก codebase และจุดที่ต้องสแกนสำหรับแต่ละ framework

---

## Detection Flow

```
Step 1: สแกน root directory หาไฟล์ระบุ framework
Step 2: ตรวจ dependencies (package.json, .csproj, pom.xml, etc.)
Step 3: ระบุ patterns เฉพาะ framework
Step 4: ใช้ patterns นั้นในการ scan flows
Step 5: ถ้าไม่รู้จัก → ใช้ generic analysis
```

## Supported Tech Stacks

### .NET Core / ASP.NET

**Detect**: `.csproj`, `Program.cs`, `Startup.cs`, `.sln`
**Scan Points**:
| จุดสแกน | หาอะไร |
|---------|--------|
| Controllers (`*Controller.cs`) | API endpoints, HTTP methods, routing |
| Services (`*Service.cs`) | Business logic, domain operations |
| DbContext / Migrations | Data model, relationships, constraints |
| Middleware | Cross-cutting concerns (auth, logging, error handling) |
| Background Services / Hosted Services | Async flows, scheduled tasks |
| SignalR Hubs | Real-time flows |
| `appsettings.json` | Configuration-dependent flows |
| Filters / Attributes | Validation, authorization |

### Node.js / Express

**Detect**: `package.json` with `express` dependency
**Scan Points**:
| จุดสแกน | หาอะไร |
|---------|--------|
| Routes (`routes/`, `router.*`) | API endpoints, HTTP methods |
| Middleware (`middleware/`) | Auth, validation, error handling |
| Models (`models/`) | Data structure, validation rules |
| Event handlers | Async flows |
| Scheduled tasks (node-cron, agenda) | Batch flows |

### Next.js

**Detect**: `next.config.*`, `app/` directory, `pages/` directory
**Scan Points**:
| จุดสแกน | หาอะไร |
|---------|--------|
| `app/` pages and layouts | Routing, page structure |
| API routes (`app/api/`) | API endpoints, Server Actions |
| Middleware / Proxy (`middleware.ts`, `proxy.ts`) | Request interception |
| Server Components | Data fetching, rendering |
| Client Components (`'use client'`) | Interactive UI, browser APIs |

### Python / Django

**Detect**: `manage.py`, `settings.py`, `wsgi.py`
**Scan Points**:
| จุดสแกน | หาอะไร |
|---------|--------|
| Views (`views.py`) | Request handlers, business logic |
| Models (`models.py`) | Data model, constraints |
| URLs (`urls.py`) | Routing |
| Signals | Event handlers |
| Management commands | CLI operations |
| Celery tasks | Async/scheduled tasks |

### Python / FastAPI

**Detect**: `main.py` with FastAPI import, `requirements.txt` with `fastapi`
**Scan Points**:
| จุดสแกน | หาอะไร |
|---------|--------|
| Routers (`routers/`) | API endpoints |
| Dependencies | Shared logic (auth, DB sessions) |
| Pydantic models | Request/response validation |
| Background tasks | Async operations |

### Java / Spring

**Detect**: `pom.xml` or `build.gradle` with Spring dependencies
**Scan Points**:
| จุดสแกน | หาอะไร |
|---------|--------|
| Controllers (`@RestController`, `@Controller`) | API endpoints |
| Services (`@Service`) | Business logic |
| Repositories (`@Repository`) | Data access |
| Event listeners (`@EventListener`) | Async flows |
| Scheduled tasks (`@Scheduled`) | Batch flows |
| Security config (`SecurityFilterChain`) | Auth flows |

### Go

**Detect**: `go.mod`, `main.go`
**Scan Points**:
| จุดสแกน | หาอะไร |
|---------|--------|
| Handlers (`handler*.go`) | Request handlers |
| Middleware | Cross-cutting concerns |
| Routes | Routing configuration |
| goroutines | Concurrent operations |

### PHP / Laravel

**Detect**: `composer.json` with `laravel/framework`, `artisan`
**Scan Points**:
| จุดสแกน | หาอะไร |
|---------|--------|
| Controllers (`app/Http/Controllers/`) | Request handlers |
| Models (`app/Models/`) | Data model, relationships |
| Middleware (`app/Http/Middleware/`) | Request filtering |
| Jobs (`app/Jobs/`) | Queued/async operations |
| Events / Listeners | Event-driven flows |
| Routes (`routes/`) | API and web routing |

### Kafka / Message Queue

**Detect**: Kafka client dependencies, `KafkaConsumer`, `KafkaProducer`
**Scan Points**:
| จุดสแกน | หาอะไร |
|---------|--------|
| Producers | Events ที่ส่งออก, topics |
| Consumers | Events ที่รับเข้า, processing logic |
| Dead Letter Queue | Error handling |
| Retry policy | Retry/idempotency configuration |

### Frontend (jQuery / Bootstrap / Vanilla JS)

**Detect**: `jquery` in scripts, Bootstrap CSS/JS, `.html` with `<script>`
**Scan Points**:
| จุดสแกน | หาอะไร |
|---------|--------|
| Event handlers (`$().on()`, `addEventListener`) | UI interactions |
| AJAX calls (`$.ajax`, `fetch`) | Backend communication |
| Form validation | Client-side vs server-side validation |
| DOM manipulation | State management |

### LINE Bot / LIFF

**Detect**: `@line/bot-sdk`, LIFF SDK, webhook handlers
**Scan Points**:
| จุดสแกน | หาอะไร |
|---------|--------|
| Webhook handlers | Message/event handling |
| Flex messages | Rich message templates |
| Rich menu | Menu states and transitions |
| LIFF pages | In-app browser flows |

### Generic (Fallback)

**เมื่อไม่รู้จัก framework**: ใช้ generic analysis
**Scan Points**:
| จุดสแกน | หาอะไร |
|---------|--------|
| Entry points (main, index, app) | Application startup |
| Config files | Environment-dependent behavior |
| API/route definitions | Endpoints |
| Data models/schemas | Data structure |
| Error handling patterns | Exception flows |
| Logging | Observability |
