# Admin Account Setup

Argus includes a master admin account feature that allows you to bypass registration and have full access to all features.

## Setup

### 1. Configure Admin Credentials

Add these to your `backend/.env` file:

```bash
# Admin Configuration
ADMIN_EMAIL=ravehaseo@gmail.com
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_ENABLED=true
```

**Note:** Use a valid email address (not `.local` domains) as Pydantic's EmailStr validation requires valid email formats.

**Important Security Notes:**
- Use a strong password
- In production, consider disabling admin bypass or using proper authentication
- The admin account bypasses Supabase authentication

### 2. Login as Admin

1. Start the application
2. Go to http://localhost:3000/login
3. Enter your admin email and password
4. You'll be automatically logged in with full admin privileges

### 3. Admin Features

As an admin, you have:

- **Unlimited Reviews:** No quota limits
- **Enterprise Tier:** Automatically set to enterprise subscription
- **Admin Endpoints:** Access to `/api/v1/admin/*` endpoints
- **All User Data:** Can view all users and reviews
- **Platform Stats:** Access to platform statistics

### 4. Admin API Endpoints

Once logged in as admin, you can access:

- `GET /api/v1/admin/users` - List all users
- `GET /api/v1/admin/reviews` - List all reviews
- `GET /api/v1/admin/stats` - Platform statistics

### 5. Frontend Integration

The frontend will automatically:
- Recognize admin users
- Show admin features
- Bypass quota restrictions
- Display admin dashboard (if implemented)

## Security Considerations

### Development
- Admin bypass is convenient for testing
- Use strong passwords
- Keep admin credentials secure

### Production
- Consider disabling `ADMIN_ENABLED=false` in production
- Or implement proper admin authentication
- Use environment-specific admin credentials
- Monitor admin access logs

## Troubleshooting

**Admin login not working:**
- Check `ADMIN_ENABLED=true` in `.env`
- Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set correctly
- Check backend logs for errors
- Ensure admin user is created in database

**Admin features not showing:**
- Verify you're logged in as admin
- Check `is_admin` flag in user record
- Clear browser cache and cookies
- Check frontend console for errors

## Creating Admin via Database

If you need to manually create an admin user:

```sql
UPDATE users 
SET is_admin = true, subscription_tier = 'enterprise' 
WHERE email = 'your-admin@email.com';
```

Or via Python:

```python
from app.core.admin import create_or_get_admin_user
from app.core.database import SessionLocal

db = SessionLocal()
admin = create_or_get_admin_user(db)
print(f"Admin created: {admin.email}")
```

