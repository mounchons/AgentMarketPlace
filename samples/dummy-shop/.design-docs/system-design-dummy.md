# Dummy Shop - System Design Document

**Version**: 1.0.0
**Date**: 2026-05-07
**Status**: Draft

## 1. Introduction & System Overview

A minimal e-commerce sample for sitemap.json dogfooding.

## 9. Sitemap & Architecture Map

See `sitemap.json` for the machine-readable inventory.

### 9.5 API Inventory

| ID | Method | Path | Controller | Auth | Middlewares |
|----|--------|------|------------|------|-------------|
| API-001 | GET | /api/orders | OrdersController.GetAll | ✓ | MW-001 |
| API-002 | POST | /api/orders | OrdersController.Create | ✓ | MW-001 |

## 10. User Roles & Permissions

| Role | Pages |
|------|-------|
| User | /orders |
