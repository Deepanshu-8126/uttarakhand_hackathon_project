/**
 * Discovery Uttarakhand — Centralized Environment Loader
 * 
 * Ensures .env is loaded predictably before any modules access process.env,
 * regardless of whether the process was started from the repository root,
 * backend directory, docker container, or testing script.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. First priority: Load backend/.env (where backend-specific secrets live)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 2. Second priority: Merge repository root .env (for root monorepo or docker mounts)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default process.env;
