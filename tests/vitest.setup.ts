import { defineEventHandler, createError, getRouterParam, readBody } from 'h3'

// Simulate Nitro auto-imports so server route handlers resolve these globals
Object.assign(globalThis, { defineEventHandler, createError, getRouterParam, readBody })
