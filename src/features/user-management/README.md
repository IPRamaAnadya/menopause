# User Management Feature

This feature provides comprehensive user management capabilities for administrators.

## Structure

```
src/features/user-management/
├── types/
│   └── index.ts                 # TypeScript interfaces for User, Filters, etc.
├── services/
│   └── user-management.service.ts  # Business logic for user operations
├── hooks/
│   ├── useUsers.ts              # React hook for fetching users with filters
│   └── useUserStats.ts          # React hook for fetching user statistics
└── index.ts                     # Barrel export
```

## API Endpoints

### GET /api/admin/users

Fetch users with filtering, searching, and pagination.

**Query Parameters:**
- `search` (optional): Search users by name or email
- `role` (optional): Filter by role (Administrator, Moderator, Content Creator, Member)
- `status` (optional): Filter by status (ACTIVE, SUSPENDED)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10, max: 100): Items per page

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "Administrator",
      "status": "ACTIVE",
      "membershipLevel": "Platinum",
      "joinedDate": "2024-01-15",
      "lastActive": "2 hours ago",
      "image": null,
      "isResetPassword": false
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### GET /api/admin/users/stats

Fetch user statistics.

**Response:**
```json
{
  "totalUsers": 1234,
  "activeToday": 456,
  "premiumMembers": 89,
  "administrators": 12
}
```

## Usage

### Using React Hooks

```typescript
import { useUsers, useUserStats } from '@/features/user-management';

function UsersPage() {
  // Fetch users with filters
  const {
    users,
    total,
    page,
    totalPages,
    loading,
    error,
    updateFilters,
    nextPage,
    previousPage,
    refresh,
  } = useUsers({
    limit: 10,
    page: 1,
  });

  // Fetch user statistics
  const { stats, loading: statsLoading } = useUserStats();

  // Update filters
  const handleSearch = (search: string) => {
    updateFilters({ search });
  };

  const handleRoleFilter = (role: string) => {
    updateFilters({ role });
  };

  const handleStatusFilter = (status: 'ACTIVE' | 'SUSPENDED') => {
    updateFilters({ status });
  };

  // ... render UI
}
```

### Direct Service Usage (Server-side)

```typescript
import { UserManagementService } from '@/features/user-management';

// Get users with filters
const result = await UserManagementService.getUsers({
  search: 'john',
  role: 'Administrator',
  status: 'ACTIVE',
  page: 1,
  limit: 10,
});

// Get user statistics
const stats = await UserManagementService.getUserStats();
```

## Features

- **Search**: Search users by name or email (case-insensitive)
- **Role Filter**: Filter by user role
- **Status Filter**: Filter by ACTIVE or SUSPENDED status
- **Pagination**: Navigate through pages with configurable limit
- **Statistics**: Get real-time user counts and metrics
- **Type Safety**: Full TypeScript support with interfaces
- **Authentication**: Protected routes requiring admin access
- **Error Handling**: Comprehensive error handling with meaningful messages

## Security

- All endpoints require authentication
- TODO: Add role-based access control to restrict to administrators only
- Input validation for pagination parameters
- SQL injection protection via Prisma ORM

## Future Enhancements

- [ ] Add role-based access control (RBAC)
- [ ] Export users to CSV/Excel
- [ ] Bulk user actions (suspend, delete, etc.)
- [ ] User activity tracking
- [ ] Advanced filters (date range, membership level, etc.)
- [ ] Real-time updates with WebSockets
