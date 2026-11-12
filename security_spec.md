# Security Specification — Kumar Saree Ghar Firestore Rules

## 1. Data Invariants
1. Public catalog collections (`/products`, `/categories`, `/gallery`, `/siteSettings`) can be modified ONLY by verified administrators (`isAdmin()`).
2. Customer enquiries (`/enquiries`) contain PII (`customerName`, `phone`, `email`) and may NEVER be read, listed, updated, or deleted by non-admin users.
3. Public enquiry creation MUST enforce `status == 'New'`, server-assigned `createdAt == request.time`, `updatedAt == request.time`, and strict field allowlists & length boundaries.
4. Reviews (`/reviews`) may only be listed/read publicly when `resource.data.published == true`. Only admins can create, update, delete, or read unpublished reviews.
5. Admin privilege escalation is blocked: users cannot create or modify `/admins/{adminUid}` unless already an `isAdmin()`.
6. All document IDs must match `^[a-zA-Z0-9_-]+$` and be <= 128 chars.
7. Timestamps (`createdAt`, `updatedAt`) must match `request.time` on create, and `createdAt` is immutable on update.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated `create` on `/products/p1` -> DENIED
2. Authenticated non-admin (`email_verified: false`) `create` on `/products/p1` -> DENIED
3. Authenticated non-admin (`random@example.com`) `update` on `/siteSettings/main` -> DENIED
4. Public `get` on `/enquiries/e1` -> DENIED (PII isolation)
5. Public `list` on `/enquiries` -> DENIED (PII query isolation)
6. Public `create` on `/enquiries/e1` with `status: "Resolved"` -> DENIED (State shortcutting)
7. Public `create` on `/enquiries/e1` with ghost field `isAdminApproved: true` -> DENIED (Shadow field)
8. Public `create` on `/enquiries/e1` with forged `createdAt` in past -> DENIED (Temporal integrity)
9. Public `list` on `/reviews` querying unpublished reviews -> DENIED (Query enforcer)
10. Non-admin `create` on `/admins/attackerUid` with `{ role: "admin" }` -> DENIED (Privilege escalation)
11. Admin `create` on `/products/bad$id` with invalid path ID -> DENIED (ID poisoning)
12. Admin `update` on `/products/p1` modifying `createdAt` -> DENIED (Immortal field)
