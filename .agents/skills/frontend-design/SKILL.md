---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics. OPTIMIZED for AppCitas - appointment booking system with React + React Bootstrap.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices. For AppCitas projects, follow the specific patterns and conventions defined in the AppCitas Project Context section.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## AppCitas Project Context

This skill is optimized for the **AppCitas** appointment booking application. When working on this project, follow these specific conventions:

### Tech Stack
- React 18+ with hooks
- React Router v6 for navigation
- React Bootstrap + Bootstrap 5 for UI components
- React Bootstrap Icons for iconography

### Project Structure
```
frontend/src/
├── pages/
│   ├── admin/
│   │   ├── AdminDashboard.js     # Main dashboard with stats and recent appointments
│   │   ├── AdminLogin.js         # Login page
│   │   ├── AdminServices.js     # CRUD for services (name, description, duration, price, activo)
│   │   ├── AdminEmployees.js    # CRUD for employees + service assignment
│   │   ├── AdminSchedules.js    # Weekly schedule management per employee
│   │   ├── AdminBlockages.js    # Date/time blocking management
│   │   ├── AdminAppointments.js # View and manage bookings with status filters
│   │   └── AdminSettings.js     # Business branding: logo, colors, description, WhatsApp, web URL
│   └── public/
│       ├── BusinessList.js       # Landing page with business listing
│       ├── BusinessDetail.js    # Business info + service selection
│       ├── BookingFlow.js       # 4-step booking: date → time → customer data → confirmation
│       └── ConfirmationPage.js   # Email token confirmation
├── contexts/
│   ├── AuthContext.js    # Authentication: useAuth() returns {user, login, logout, loading}
│   └── ThemeContext.js   # Theming: useTheme() returns {theme, business, setBusiness, setTheme}
├── services/
│   └── api.js           # adminApi (authenticated) and publicApi (public endpoints)
└── components/
    └── ProtectedRoute.js # Route guard for admin pages
```

### Code Patterns

**Authentication:**
- Use `useAuth()` hook from `../../contexts/AuthContext`
- Token stored in localStorage as `adminToken`
- Token contains JWT payload with user data

**API Calls:**
- Use `adminApi` for authenticated endpoints (pass token: `user.token`)
- Use `publicApi` for public endpoints (no token required)
- Both use `fetchWithAuth` wrapper with error handling
- Error responses throw with `status` and `data` properties

**Appointment States:**
- `pendiente` (pending) - Yellow/warning badge
- `confirmada` (confirmed) - Green/success badge
- `completada` (completed) - Blue/primary badge
- `cancelada` (cancelled) - Red/danger badge
- `no_show` - Gray/secondary badge

**Theming:**
- Use `useTheme()` hook for business branding colors
- CSS variables: `--primary-color`, `--secondary-color`, `--accent-color`
- Apply via inline styles or Bootstrap color utilities (text-primary, bg-success, etc.)

### Available API Endpoints

**Public API (no auth required):**
- `publicApi.getBusinesses()` - List all active businesses
- `publicApi.getBusiness(slug)` - Get business by slug
- `publicApi.getServices(slug)` - Get business services
- `publicApi.getAvailability(slug, date, serviceIds)` - Check availability slots
- `publicApi.createBooking(slug, data)` - Create new booking
- `publicApi.confirmBooking(token)` - Confirm booking via email token
- `publicApi.resendConfirmation(email, name, date, startTime)` - Resend confirmation email

**Admin API (requires JWT token):**
- Authentication: `adminApi.login(email, password)`
- Businesses: `getNegocios`, `updateNegocio(negocioId, data)`, `uploadLogo(negocioId, file)`
- Services: `getServices`, `createService(data)`, `updateService(id, data)`, `deleteService(id)`
- Employees: `getEmployees`, `createEmployee(data)`, `updateEmployee(id, data)`, `deleteEmployee(id)`
- Employee Services: `getEmployeeServices(employeeId)`, `assignService(data)`, `unassignService(employeeId, serviceId)`
- Schedules: `getBusinessSchedules(negocioId)`, `updateBusinessSchedules(negocioId, data)`, `getEmployeeSchedules(employeeId)`, `updateEmployeeSchedules(employeeId, data)`
- Blockages: `getBlockages(params)`, `createBlockage(data)`, `deleteBlockage(id)`
- Appointments: `getAppointments(params)`, `updateAppointmentStatus(id, estado)`

### UI Component Guidelines

- Use React Bootstrap components: `Container`, `Row`, `Col`, `Card`, `Table`, `Modal`, `Form`, `Button`, `Badge`, `Spinner`, `ListGroup`, `Nav`
- Icons from `react-bootstrap-icons`: `Shop`, `Calendar`, `People`, `Clock`, `Ban`, `Palette`, `BoxArrowRight`, `ChevronRight`, `Plus`, `Pencil`, `Trash`
- Loading states: `<Spinner animation="border" />`
- Error handling: try/catch with user-friendly messages and console.error for debugging
- Tables: Use `Table` component with `variant="stripped"` or `variant="hover"`
- Forms: Use `Form.Group`, `Form.Label`, `Form.Control`, `Form.Select` with Bootstrap validation
- Modals: Use `Modal`, `Modal.Header`, `Modal.Title`, `Modal.Body`, `Modal.Footer`

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. For AppCitas, leverage the business branding colors from ThemeContext.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

