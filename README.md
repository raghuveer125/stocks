# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## PostgreSQL & pgAdmin Setup

### Connect to PostgreSQL using pgAdmin

1. **Access pgAdmin:**
   - Open your browser and navigate to: `http://localhost:5050`

2. **Login Credentials:**
   - **Email:** `admin@admin.com`
   - **Password:** `admin`

3. **Add PostgreSQL Server in pgAdmin:**
   - After logging in, click **"Add New Server"**
   - Go to the **General** tab and enter:
     - **Name:** `Stock Trading DB` (or any name you prefer)
   
   - Go to the **Connection** tab and enter:
     - **Host name/address:** `postgres`
     - **Port:** `5432`
     - **Maintenance database:** `stock_trading`
     - **Username:** `trader`
     - **Password:** `trader123`
   
   - Click **Save**

4. **Direct PostgreSQL Connection (for applications):**
   - **Host:** `localhost`
   - **Port:** `5432`
   - **Database:** `stock_trading`
   - **Username:** `trader`
   - **Password:** `trader123`

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
