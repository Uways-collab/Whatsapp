# Security Specification

## 1. Data Invariants
- Merchants can only create or update their own store profile where `id == request.auth.uid` and `ownerId == request.auth.uid`.
- Store slugs must be URL-safe (lowercase letters, numbers, hyphens) and between 2 and 50 characters.
- WhatsApp numbers must be between 10 and 20 digits (e.g. formatted with international prefix like 234...).
- Products can only be created, updated, or deleted by the merchant owning the store (`merchantId == request.auth.uid`).
- Product prices must be positive numbers and names must be valid non-empty strings.
- Public read access is granted for buyers to view merchant profiles and active products.

## 2. The "Dirty Dozen" Payloads (Must be REJECTED)
1. **Unauthenticated Merchant Creation**: Non-signed in user attempting to write `/merchants/user123`.
2. **Owner Spoofing on Merchant Create**: User A trying to set `ownerId: "userB"` on `/merchants/userA`.
3. **Impersonated Merchant Creation**: User A writing to `/merchants/userB` where document ID does not match auth UID.
4. **Invalid WhatsApp Format**: Merchant payload with non-numeric or short whatsappNumber (e.g. `whatsappNumber: "hello"`).
5. **Slug Injection**: Merchant payload with malicious characters or oversized slug (e.g. `slug: "../admin"`).
6. **Owner Modification on Update**: User A trying to change `ownerId` to `userB` on existing merchant doc.
7. **Unauthenticated Product Creation**: Anonymous/unauthenticated user creating a product in `/products/prod1`.
8. **Product Hijack on Create**: User A creating a product with `merchantId: "userB"`.
9. **Cross-Tenant Product Update**: User B attempting to edit User A's product.
10. **Cross-Tenant Product Deletion**: User B attempting to delete User A's product.
11. **Negative Price Injection**: Product update setting `price: -500`.
12. **Oversized String Payload Attack**: Product creation with `name` exceeding max length (10,000 characters).

## 3. Security Rules Blueprint
Rules enforce attribute-based access control, strict type and length constraints matching `firebase-blueprint.json`, and ensure only authorized owners can modify their catalog.
