import type { APIRoute } from 'astro';
import { handleGet } from '../estado';

export const prerender = false;

export const GET: APIRoute = ({ params }) => handleGet(params.ref ?? '');
