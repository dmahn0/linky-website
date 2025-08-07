# Schema Mapping Documentation

## Overview

This document provides a comprehensive mapping between frontend form fields, API layer processing, and actual database schema to ensure 100% consistency across the Linky Platform.

## Database Schema Summary

### Core Tables

#### 1. business_users
- **Primary Key**: `id` (BIGINT, Auto-increment)
- **Auth Reference**: `auth_uid` (UUID, References auth.users.id)
- **Required Fields**: `email`, `business_name`, `business_type`, `owner_name`, `phone`
- **Optional Fields**: `address`, `business_registration_number`, etc.

#### 2. partners_users
- **Primary Key**: `id` (BIGINT, Auto-increment)
- **Auth Reference**: `auth_uid` (UUID, References auth.users.id)
- **Required Fields**: `email`, `name`, `phone`
- **Optional Fields**: `birth_date`, `gender`, `address`, `bio`, etc.

#### 3. admin_users
- **Primary Key**: `id` (BIGINT, Auto-increment)
- **Auth Reference**: `auth_uid` (UUID, References auth.users.id)
- **Required Fields**: `email`, `name`

#### 4. spaces
- **Primary Key**: `id` (BIGINT, Auto-increment)
- **Foreign Key**: `business_id` (BIGINT, References business_users.id)
- **Required Fields**: `name`, `space_type`, `address`

#### 5. jobs
- **Primary Key**: `id` (BIGINT, Auto-increment)
- **Foreign Keys**: 
  - `business_id` (BIGINT, References business_users.id)
  - `space_id` (BIGINT, References spaces.id)
  - `assigned_partner_id` (BIGINT, References partners_users.id)

#### 6. job_applications
- **Primary Key**: `id` (BIGINT, Auto-increment)
- **Foreign Keys**:
  - `job_id` (BIGINT, References jobs.id)
  - `partner_id` (BIGINT, References partners_users.id)

## Frontend-to-Backend Mapping

### Business Signup Form Mapping

| Frontend Field | HTML ID | JavaScript Variable | Database Column | Data Type | Required |
|---|---|---|---|---|---|
| Email | `email` | `formData.email` | `email` | VARCHAR | ✅ |
| Password | `password` | `formData.password` | N/A (Supabase Auth) | N/A | ✅ |
| Business Name | `businessName` | `formData.businessName` | `business_name` | VARCHAR | ✅ |
| Business Type | `spaceType` | `formData.businessType` | `business_type` | VARCHAR | ✅ |
| Owner Name | `ownerName` | `formData.ownerName` | `owner_name` | VARCHAR | ✅ |
| Phone | `phone` | `formData.phone` | `phone` | VARCHAR | ✅ |
| Address | `address` | `formData.address` | `address` | TEXT | ❌ |
| Business Registration | `businessRegistrationNumber` | `formData.businessRegistrationNumber` | `business_registration_number` | VARCHAR | ❌ |
| Space Count | `spaceCount` | `formData.spaceCount` | `space_count` | INTEGER | ❌ |
| Special Requirements | `specialRequirements` | `formData.specialRequirements` | `metadata.special_requirements` | JSONB | ❌ |

### Partners Signup Form Mapping

| Frontend Field | HTML ID | JavaScript Variable | Database Column | Data Type | Required |
|---|---|---|---|---|---|
| Email | `email` | `formData.email` | `email` | VARCHAR | ✅ |
| Password | `password` | `formData.password` | N/A (Supabase Auth) | N/A | ✅ |
| Name | `name` | `formData.name` | `name` | VARCHAR | ✅ |
| Phone | `phone` | `formData.phone` | `phone` | VARCHAR | ✅ |
| Birth Date | `birthDate` | `formData.birthDate` | `birth_date` | DATE | ❌ |
| Gender | `gender` | `formData.gender` | `gender` | VARCHAR | ❌ |
| Address | `address` | `formData.address` | `address` | TEXT | ✅ |
| Bio | `bio` | `formData.bio` | `bio` | TEXT | ❌ |
| Preferred Job Types | N/A (Tags) | `selectedSkills` | `preferred_job_types` | TEXT[] | ❌ |
| Preferred Areas | N/A (Tags) | `selectedAreas` | `preferred_areas` | TEXT[] | ❌ |

## API Layer Mappings

### AuthManager Methods

#### signup(email, password, userType, profileData)
- **Business**: Inserts into `business_users` table
- **Partners**: Inserts into `partners_users` table
- **Auth UID**: Links to Supabase Auth `users.id`

#### getUserProfile(authUid, userType)
**Table Mapping**:
- `business` → `business_users`
- `partners` → `partners_users`  
- `admin` → `admin_users`

**Query**: `SELECT * FROM {tableName} WHERE auth_uid = {authUid}`

### BusinessAPI Methods

#### getDashboardStats(authUid)
1. Query `business_users` by `auth_uid`
2. Query `spaces` by `business_id`
3. Query `jobs` by `business_id`

#### getSpaces(authUid)
1. Query `business_users` by `auth_uid`
2. Query `spaces` by `business_id`

#### createSpace(businessId, spaceData)
- Insert into `spaces` with `business_id`

#### getJobs(authUid)
1. Query `business_users` by `auth_uid`
2. Query `jobs` by `business_id` with joins to `spaces` and `partners_users`

### PartnersAPI Methods

#### getDashboardStats(authUid)
1. Query `partners_users` by `auth_uid`
2. Query `jobs` by `assigned_partner_id`

#### getMyJobs(authUid)
1. Query `partners_users` by `auth_uid`
2. Query `jobs` by `assigned_partner_id`

#### applyForJob(jobId, partnerId, message)
- Insert into `job_applications` with `job_id` and `partner_id`

## Fixed Schema Inconsistencies

### ✅ Resolved Issues

1. **Table Name Fix**: 
   - `admins` → `admin_users` (in auth.js)
   - `partner_users` → `partners_users` (in api.js)

2. **Field Reference Fix**:
   - Jobs table partner reference: `partner_id` → `assigned_partner_id`
   - Updated in BusinessAPI.assignPartner(), PartnersAPI.getDashboardStats(), PartnersAPI.getMyJobs()

3. **Maintained Correct References**:
   - `job_applications.partner_id` remains correct (references partners_users.id)
   - All other field mappings verified and confirmed correct

## Database Relationships

```
business_users (1) ←→ (many) spaces
business_users (1) ←→ (many) jobs
partners_users (1) ←→ (many) jobs (via assigned_partner_id)
partners_users (1) ←→ (many) job_applications
spaces (1) ←→ (many) jobs
jobs (1) ←→ (many) job_applications
jobs (1) ←→ (many) reviews
```

## Status Values

### Common Status Fields
- **business_users.status**: `pending`, `active`, `suspended`
- **partners_users.status**: `pending`, `active`, `suspended`
- **partners_users.verification_status**: `pending`, `verified`, `rejected`
- **partners_users.availability_status**: `online`, `offline`, `busy`
- **jobs.status**: `pending`, `assigned`, `in_progress`, `completed`, `cancelled`
- **job_applications.status**: `pending`, `accepted`, `rejected`

## Error Prevention Guidelines

1. **Always use table names exactly as defined in database**
2. **Use correct field names for foreign key relationships**
3. **Validate data types match between frontend and backend**
4. **Ensure required fields are handled properly in validation**
5. **Use proper BIGINT references for ID fields**
6. **Handle UUID fields correctly for auth_uid references**

## Testing Checklist

- [ ] Business signup creates record in `business_users` table
- [ ] Partners signup creates record in `partners_users` table
- [ ] Auth UID properly links to Supabase Auth users
- [ ] Foreign key relationships work correctly
- [ ] API methods use correct table and field names
- [ ] Status transitions work as expected
- [ ] Data validation prevents schema violations

## Future Maintenance

When adding new fields or tables:
1. Update this documentation
2. Verify frontend form mappings
3. Update API layer methods
4. Test all affected signup/login flows
5. Run schema consistency checks