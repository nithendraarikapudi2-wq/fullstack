# PS-06 Accessible Knowledge Management Portal

Full-stack knowledge portal for creating, categorizing, navigating, and searching articles, documents, and references.

## Stack

- Frontend: React + Vite
- Backend: Spring Boot (compatible with Spring Tool Suite / IntelliJ IDEA / Eclipse)
- Database: PostgreSQL
- Recommended tools: PostgreSQL server, Spring Tool Suite or IntelliJ IDEA, Maven

## Project Structure

- `frontend/` - React accessible knowledge portal UI
- `backend/` - Spring Boot REST API

## Run Backend

1. Install PostgreSQL locally and create a database and user, for example:

```sql
CREATE DATABASE knowledge_portal;
CREATE USER knowledge_user WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE knowledge_portal TO knowledge_user;
```

2. Update database credentials in `backend/src/main/resources/application.properties`.

3. Open `backend/` in Spring Tool Suite, IntelliJ IDEA, or Eclipse and run `KnowledgePortalApplication`.

Note: registered user accounts are persisted in PostgreSQL in the `app_users` table. You can verify them with `SELECT id, full_name, email, role, created_at FROM app_users;`.

Or run from terminal:

```bash
cd backend
mvn spring-boot:run
```

The backend starts on `http://localhost:8010` by default.

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:8005`.

If needed, configure the backend API base in `frontend/.env`:

```text
VITE_API_BASE=http://localhost:8010/api
```

On Windows PowerShell, if `npm` is blocked by script execution policy, use `npm.cmd`:

```bash
npm.cmd install
npm.cmd run dev
```

To view the production build:

```bash
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 4173
```

## API Highlights

- `POST /api/auth/signup` - create user account
- `POST /api/auth/login` - log in with email and password
- `POST /api/auth/signin` - sign in with email and password
- `GET /api/documents` - list documents
- `POST /api/documents` - create document
- `GET /api/categories` - list categories
- `GET /api/search?query=cloud deployment strategies` - query documents
- `GET /api/search/semantic?query=microservices architecture concepts` - semantic-style discovery endpoint
- `GET /api/users` - list registered users stored in PostgreSQL

Auth request example:

```json
{
  "fullName": "Student User",
  "email": "student@example.com",
  "password": "secret123"
}
```

## Notes About Semantic Search

The backend includes a semantic discovery endpoint that ranks content with keyword and context weighting in PostgreSQL. For production vector search, add PostgreSQL `pgvector` or MongoDB Atlas Vector Search and replace `SearchService.semanticSearch` with embedding similarity.

## Deploying to Render

This project contains a `render.yaml` blueprint configuration in the root directory. You can deploy the entire ecosystem (Frontend, API Gateway, Spring Boot Backend, and Node.js Backend) to Render simultaneously:

1. Create a Render account at [render.com](https://render.com).
2. Create a new PostgreSQL Database on Render. Note down the Database URL, username, and password.
3. Push this repository to your GitHub account.
4. On the Render Dashboard, click **New +** and select **Blueprint**.
5. Connect your GitHub repository.
6. Render will automatically detect the `render.yaml` file. Provide the following environment variables:
   - For `knowledge-portal-backend`:
     - `SPRING_DATASOURCE_URL`: The PostgreSQL Database URL.
     - `SPRING_DATASOURCE_USERNAME`: The PostgreSQL username.
     - `SPRING_DATASOURCE_PASSWORD`: The PostgreSQL password.
   - For `knowledge-portal-comments`:
     - `MONGO_URI`: A MongoDB connection string (e.g., from MongoDB Atlas). If left blank, it will automatically run in-memory!
7. Click **Apply**. Render will automatically provision and build all services.

Once deployed, the static frontend will communicate with the backends securely through the FastAPI Gateway.
