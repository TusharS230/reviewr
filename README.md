# Reviewr

Reviewr is a small full-stack app where developers share code snippets and review each other's code. You post a snippet, other people rate it from 1 to 5 and leave a comment, and you can see what everyone thought.

**Live demo:** https://regal-rugelach-30835c.netlify.app/

The backend runs on Render's free plan, so the first request after a quiet period can take up to a minute while the server wakes up.

Backend: Java 17, Spring Boot, Spring Security with JWT, PostgreSQL.
Frontend: plain HTML, CSS and JavaScript (ES modules), no framework.

## Features

- Sign up, sign in and change your password. Passwords are hashed with BCrypt and logins use JWT tokens.
- Browse every snippet without an account. Each card shows the author and when it was posted.
- Filter snippets by language (Java, JavaScript, Python, C++, SQL) and sort by newest, oldest or title.
- Open any snippet in a full code viewer and copy it with one click.
- Rate and review snippets. Each snippet shows its average rating and all its reviews.
- "My Snippets" and "My Reviews" pages. You can delete your own reviews and nobody else's.
- Clear error messages on every form, and Escape closes any open window.

## Project structure

```
reviewr/
├── backend/                     Spring Boot API
│   └── src/main/java/com/reviewr/
│       ├── config/              security setup, user loading
│       ├── controller/          REST endpoints
│       ├── dto/                 request and response objects
│       ├── exception/           one place that turns errors into JSON
│       ├── model/               JPA entities: User, Snippet, Review
│       ├── repository/          Spring Data repositories
│       ├── security/            JWT creation and the request filter
│       └── service/             business rules
└── frontend/                    static site
    ├── index.html, login.html, register.html
    ├── style.css
    └── js/                      one file per feature
```

## Running it locally

You need JDK 17 or newer, Maven (or the included `mvnw`) and PostgreSQL.

**1. Create the database**

```sql
CREATE DATABASE reviewr_db;
```

**2. Start the backend**

```bash
cd backend
./mvnw spring-boot:run        # on Windows: mvnw.cmd spring-boot:run
```

By default it connects to `localhost:5432/reviewr_db` as `postgres`. If your database uses other details, set the environment variables below instead of editing the code. The tables are created automatically on first start. The API runs on `http://localhost:8080`.

**3. Open the frontend**

Serve the `frontend` folder with any static server, for example the VS Code Live Server extension, or:

```bash
cd frontend
python -m http.server 5500
```

Then open `http://localhost:5500`. When the page runs on `localhost`, it talks to `http://localhost:8080/api` automatically (see `js/config.js`).

## Configuration

| Variable | What it is | Default |
|---|---|---|
| `SPRING_DATASOURCE_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/reviewr_db` |
| `SPRING_DATASOURCE_USERNAME` | database user | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | database password | `postgre` |
| `JWT_SECRET` | key used to sign login tokens, at least 32 characters | a development-only value |
| `JWT_EXPIRATION_MS` | how long a login lasts | `86400000` (24 hours) |

Always set your own `JWT_SECRET` in production. The default is only there so the app starts on your machine.

## API

All endpoints start with `/api`. Endpoints marked "token" need an `Authorization: Bearer <token>` header.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/users/register` | public | create an account |
| POST | `/users/login` | public | returns `{ "token": "..." }` |
| PUT | `/users/change-password` | token | change your password |
| GET | `/users/{id}` | token | public profile (id and username) |
| GET | `/snippets?lang=Java` | public | all snippets, optionally by language |
| GET | `/snippets/my-snippets` | token | your snippets |
| POST | `/snippets` | token | create a snippet |
| GET | `/reviews/snippet/{id}` | public | reviews for one snippet |
| GET | `/reviews/my-reviews` | token | reviews you wrote |
| POST | `/reviews` | token | add a review |
| DELETE | `/reviews/{id}` | token | delete one of your own reviews |

Errors always come back as JSON in the same shape:

```json
{ "status": 400, "message": "Comment cannot be empty or just spaces", "timestamp": 1763200000000 }
```

## Tests

```bash
cd backend
./mvnw test
```

The unit tests in `src/test/java/com/reviewr/service` cover the security rules: only the author can delete a review, a new post can't overwrite an existing one, and login gives the same answer for an unknown email and a wrong password. `ReviewrApplicationTests` starts the full app, so it needs PostgreSQL running.

## Deployment

**Backend (Render).** Create a Web Service from this repository, set the root directory to `backend` and use the included `Dockerfile`. Add the environment variables from the table above, including your own `JWT_SECRET`.

**Frontend (Netlify or Vercel).** Deploy the `frontend` folder as a static site. If your backend URL is different, change the production URL in `frontend/js/config.js`.

## License

MIT
