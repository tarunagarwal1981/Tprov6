# 🎯 Travel Agent Database Setup Guide

## ✅ Complete Setup Instructions for Travel Agent Dashboard Access

This guide provides step-by-step instructions to set up a travel agent user in your database and ensure the agent dashboard is properly accessible.

## 🚀 Quick Setup (Recommended)

### Method 1: Using JavaScript Script (Easiest)

1. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Configure the Script**
   - Open `create-travel-agent-user.js`
   - Replace `YOUR_SUPABASE_URL` with your Supabase project URL
   - Replace `YOUR_SUPABASE_SERVICE_ROLE_KEY` with your service role key
   - Get these from your Supabase project settings

3. **Run the Script**
   ```bash
   node create-travel-agent-user.js
   ```

4. **Verify Setup**
   - The script will create the user and verify everything is working
   - Check the console output for success messages

### Method 2: Using Supabase Dashboard + SQL

1. **Create User in Supabase Auth**
   - Go to your Supabase Dashboard
   - Navigate to Authentication > Users
   - Click "Add user"
   - Fill in:
     - Email: `agent@travelplatform.com`
     - Password: `SecurePassword123!`
     - Confirm email: ✅
   - Copy the generated UUID

2. **Run SQL Setup**
   - Open `quick-agent-setup.sql`
   - Replace `AGENT_UUID_HERE` with the UUID from step 1
   - Run the SQL in your Supabase SQL editor

3. **Verify Setup**
   - Run the verification queries at the end of the SQL file

## 📊 Database Schema Overview

### Tables Created

1. **`travel_agents`** - Agent profile information
2. **`leads`** - Customer leads assigned to agents
3. **`itineraries`** - Travel itineraries created by agents
4. **`itinerary_days`** - Daily itinerary breakdown
5. **`itinerary_activities`** - Activities within each day
6. **`itinerary_packages`** - Packages included in itineraries
7. **`custom_itinerary_items`** - Custom items (flights, hotels, etc.)
8. **`booking_requests`** - Requests sent to tour operators
9. **`commissions`** - Agent commission tracking
10. **`communication_log`** - Customer communication history

### Key Relationships

```
users (auth.users) → travel_agents (profile)
users → leads (agent_id)
leads → itineraries (lead_id)
itineraries → itinerary_days
itinerary_days → itinerary_activities
itineraries → itinerary_packages
itineraries → custom_itinerary_items
itineraries → booking_requests
users → commissions (agent_id)
leads → communication_log
```

## 🔐 Security & Access Control

### Row Level Security (RLS) Policies

All tables have RLS enabled with policies ensuring:
- Agents can only see their own data
- Agents can only modify their own leads and itineraries
- Proper data isolation between agents

### Role-Based Access

- **TRAVEL_AGENT**: Can access agent dashboard and manage their own data
- **ADMIN**: Can access all dashboards and manage all data
- **SUPER_ADMIN**: Full system access

## 🎯 Agent Dashboard Access

### Login Credentials
- **Email**: `agent@travelplatform.com`
- **Password**: `SecurePassword123!`
- **Dashboard URL**: `/agent/dashboard`

### Features Available
- ✅ Lead Management
- ✅ Itinerary Creation
- ✅ Package Browsing
- ✅ Booking Management
- ✅ Commission Tracking
- ✅ Communication Tools
- ✅ Analytics Dashboard

## 📝 Sample Data Included

### Lead Example
- **Customer**: Sarah Johnson
- **Destination**: Bali, Indonesia
- **Budget**: $3,000
- **Trip Type**: Adventure
- **Status**: New

### Itinerary Example
- **Title**: Bali Adventure Package
- **Duration**: 7 days
- **Customer Price**: $3,000
- **Agent Commission**: $280
- **Status**: Draft

## 🔧 Customization Options

### User Information
Modify the following in the setup scripts:
- Name and contact details
- Company information
- License number
- Specializations
- Commission rates

### Sample Data
Customize the sample lead and itinerary:
- Customer information
- Destination and budget
- Trip preferences
- Pricing structure

### Business Rules
Adjust:
- Commission rates
- Lead statuses
- Itinerary statuses
- Booking request workflows

## 🚨 Troubleshooting

### Common Issues

1. **User Not Found**
   - Verify the UUID is correct
   - Check if user exists in auth.users
   - Ensure email confirmation is complete

2. **Permission Denied**
   - Check RLS policies are enabled
   - Verify user role is TRAVEL_AGENT
   - Ensure proper foreign key relationships

3. **Dashboard Not Accessible**
   - Check authentication context
   - Verify route protection
   - Ensure user is logged in

4. **Data Not Loading**
   - Check database connections
   - Verify service configurations
   - Check console for errors

### Verification Queries

```sql
-- Check user exists
SELECT * FROM public.users WHERE email = 'agent@travelplatform.com';

-- Check travel agent profile
SELECT * FROM public.travel_agents WHERE user_id = 'YOUR_UUID';

-- Check sample data
SELECT * FROM public.leads WHERE agent_id = 'YOUR_UUID';
SELECT * FROM public.itineraries WHERE agent_id = 'YOUR_UUID';
```

## 🔄 Maintenance

### Regular Tasks
- Monitor agent performance
- Update commission rates
- Review lead conversion rates
- Backup agent data

### Scaling Considerations
- Add more agents as needed
- Implement lead distribution
- Set up automated notifications
- Monitor system performance

## 📞 Support

### Getting Help
- Check Supabase documentation
- Review error logs
- Test with sample data
- Verify database connections

### Additional Resources
- Supabase Auth documentation
- Row Level Security guide
- Database schema reference
- API documentation

## 🎉 Success Checklist

- [ ] User created in auth.users
- [ ] User inserted into public.users
- [ ] Travel agent profile created
- [ ] Sample data inserted
- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] Dashboard accessible
- [ ] Login working
- [ ] Data loading correctly
- [ ] Permissions working

Once all items are checked, your travel agent dashboard is ready for use! 🚀
