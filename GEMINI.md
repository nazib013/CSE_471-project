# Project Status: CSE_471 Animal Rescue Platform

## Context for Gemini CLI
This project is an Animal Rescue and Adoption platform built with React (Client) and Node.js/Express (Server). 

### Current State:
- **Project Structure:** Monorepo with `client/` and `server/`.
- **Backend:** Express, Mongoose, Gemini API integration, SSLCommerz integration.
- **Frontend:** React, React Router, Context API (Auth, Cart).
- **Environment Variables:** Required variables are listed in `server/.env.template`.

### Setup Instructions for Mac (Sync):
1. Delete `node_modules` folders in both `client/` and `server/`.
2. Run `npm install` in both directories.
3. Create `server/.env` based on `server/.env.template`.
4. Run `node server/test_env.js` to verify environment setup.

### Recent Progress:
- Added `server/.env.template` for easier setup.
- Identified environment requirements from `test_env.js`.
- Current focus: Fixing cross-OS compatibility issues.
