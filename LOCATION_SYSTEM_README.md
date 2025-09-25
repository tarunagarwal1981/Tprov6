# 🗺️ Modular Location System

A comprehensive, scalable location management system for your travel application with API integration, database support, and intelligent caching.

## 🚀 Features

- **🌐 API Integration**: GeoNames API with fallback to static data
- **🗄️ Database Support**: Supabase integration with full-text search
- **⚡ Smart Caching**: 5-minute cache with LRU eviction
- **🔍 Debounced Search**: 300ms debounce for optimal performance
- **🎨 Multiple Display Formats**: Name, Name-State, Name-State-Country
- **✏️ Custom Input Support**: Allow users to enter custom locations
- **📋 Multi-Select**: Select multiple locations with badges
- **⭐ Popular Cities**: Pre-loaded popular destinations
- **🛡️ Error Handling**: Graceful fallbacks and error states
- **📝 TypeScript Support**: Full type safety and IntelliSense

## 📁 File Structure

```
src/
├── lib/
│   ├── types/
│   │   └── location.ts                 # TypeScript interfaces
│   ├── services/
│   │   ├── locationService.ts          # Core API service
│   │   ├── supabaseLocationService.ts  # Database service
│   │   └── enhancedLocationService.ts  # Combined service
│   ├── config/
│   │   └── location.ts                 # Configuration
│   └── utils/
│       └── locationUtils.ts            # Utility functions
├── hooks/
│   └── useLocation.ts                  # React hooks
├── components/
│   ├── ui/
│   │   ├── LocationInput.tsx           # Single location input
│   │   └── LocationMultiSelect.tsx     # Multi-location selector
│   └── packages/
│       └── create/
│           ├── EnhancedLocationFields.tsx      # Form integration
│           └── LocationIntegrationExample.tsx  # Usage example
└── lib/database/
    └── location-schema.sql             # Database schema
```

## 🛠️ Setup Instructions

### 1. Environment Configuration

Add your GeoNames API key to your environment variables:

```bash
# .env.local
NEXT_PUBLIC_GEONAMES_API_KEY=your_geonames_username_here
```

**Get a free GeoNames API key**: [https://www.geonames.org/login](https://www.geonames.org/login)

### 2. Database Setup

Run the location schema SQL to create the cities table:

```sql
-- Execute this in your Supabase SQL editor
-- File: src/lib/database/location-schema.sql
```

### 3. Installation

The system is already integrated into your project. No additional packages required.

## 🎯 Usage Examples

### Basic Location Input

```tsx
import { LocationInput } from '@/components/ui/LocationInput';

function MyComponent() {
  const [location, setLocation] = useState('');

  return (
    <LocationInput
      value={location}
      onChange={setLocation}
      placeholder="Search cities..."
      country="India"
      displayFormat="name-state"
    />
  );
}
```

### Multi-Location Selection

```tsx
import { LocationMultiSelect } from '@/components/ui/LocationInput';

function MyComponent() {
  const [locations, setLocations] = useState([]);

  return (
    <LocationMultiSelect
      selectedLocations={locations}
      onLocationsChange={setLocations}
      placeholder="Search and add locations..."
      maxSelections={10}
    />
  );
}
```

### Form Integration

```tsx
import { EnhancedLocationFields } from '@/components/packages/create/EnhancedLocationFields';

function PackageForm() {
  const [formData, setFormData] = useState({
    place: '',
    fromLocation: '',
    toLocation: '',
    multipleDestinations: [],
    pickupPoints: []
  });

  return (
    <EnhancedLocationFields
      packageType={PackageType.TRANSFERS}
      formData={formData}
      onFormDataChange={setFormData}
      displayFormat="name-state"
      country="India"
    />
  );
}
```

### Using Hooks

```tsx
import { useLocationSearch, usePopularCities } from '@/hooks/useLocation';

function MyComponent() {
  const { locations, loading, search } = useLocationSearch({
    defaultCountry: 'India',
    limit: 10
  });

  const { cities: popularCities } = usePopularCities('India');

  return (
    <div>
      <input onChange={(e) => search(e.target.value)} />
      {loading ? 'Loading...' : locations.map(loc => (
        <div key={loc.id}>{loc.name}</div>
      ))}
    </div>
  );
}
```

## 🔧 Configuration Options

### LocationInput Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Current location value |
| `onChange` | `(location: Location \| string) => void` | - | Change handler |
| `placeholder` | `string` | `'Search cities...'` | Input placeholder |
| `mode` | `'search' \| 'select' \| 'both'` | `'both'` | Input mode |
| `displayFormat` | `LocationDisplayFormat` | `'name-state'` | Display format |
| `country` | `string` | `'India'` | Default country filter |
| `required` | `boolean` | `false` | Required field |
| `disabled` | `boolean` | `false` | Disabled state |
| `showCoordinates` | `boolean` | `false` | Show coordinates |
| `allowCustomInput` | `boolean` | `true` | Allow custom input |

### LocationMultiSelect Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedLocations` | `Location[]` | `[]` | Selected locations |
| `onLocationsChange` | `(locations: Location[]) => void` | - | Change handler |
| `maxSelections` | `number` | `undefined` | Maximum selections |
| `displayFormat` | `LocationDisplayFormat` | `'name-state'` | Display format |
| `country` | `string` | `'India'` | Default country filter |

## 🎨 Display Formats

- **`name`**: "Mumbai"
- **`name-state`**: "Mumbai, Maharashtra"
- **`name-state-country`**: "Mumbai, Maharashtra, India"
- **`full`**: "Mumbai, Maharashtra, India"

## 🔍 Search Behavior

1. **Database First**: Queries Supabase for fast, accurate results
2. **API Fallback**: Uses GeoNames API if database fails
3. **Static Fallback**: Uses pre-loaded popular cities as last resort
4. **Smart Caching**: 5-minute cache with LRU eviction
5. **Debounced Input**: 300ms debounce for optimal performance

## 🗄️ Database Schema

The system includes a comprehensive database schema with:

- **Cities table**: Main location data with coordinates, population
- **Countries table**: Country reference data
- **States table**: State/Province reference data
- **Full-text search**: PostgreSQL full-text search capabilities
- **RLS policies**: Row-level security for data access
- **Functions**: Custom search and popular cities functions

## 🚀 Performance Features

- **Intelligent Caching**: Reduces API calls and database queries
- **Debounced Search**: Prevents excessive API requests
- **Lazy Loading**: Loads data only when needed
- **Error Boundaries**: Graceful error handling
- **Fallback Strategies**: Multiple data sources for reliability

## 🔒 Security Features

- **RLS Policies**: Row-level security for database access
- **Input Validation**: Validates all location data
- **SQL Injection Protection**: Parameterized queries
- **Rate Limiting**: Built-in API rate limiting

## 🧪 Testing

The system includes comprehensive error handling and fallback mechanisms:

- API failures gracefully fall back to static data
- Database errors don't break the UI
- Network issues are handled gracefully
- Invalid data is filtered out

## 📈 Scalability

- **Modular Design**: Easy to extend and modify
- **Service Layer**: Clean separation of concerns
- **Caching Strategy**: Reduces load on external APIs
- **Database Optimization**: Indexed queries for performance
- **Type Safety**: Full TypeScript support

## 🔄 Migration from Existing Code

To migrate your existing hardcoded location fields:

1. **Replace Input components**:
   ```tsx
   // Before
   <Input value={place} onChange={setPlace} />
   
   // After
   <LocationInput value={place} onChange={setPlace} />
   ```

2. **Update form data handling**:
   ```tsx
   // Before
   const [place, setPlace] = useState('');
   
   // After
   const [place, setPlace] = useState('');
   // LocationInput handles both string and Location objects
   ```

3. **Replace hardcoded options**:
   ```tsx
   // Before
   <Select options={[
     { value: 'mumbai', label: 'Mumbai' },
     { value: 'delhi', label: 'Delhi' }
   ]} />
   
   // After
   <LocationInput mode="select" />
   ```

## 🆘 Troubleshooting

### Common Issues

1. **API Key Not Working**:
   - Verify your GeoNames username is correct
   - Check if you've exceeded the free tier limits (1000 requests/hour)

2. **Database Connection Issues**:
   - Ensure Supabase is properly configured
   - Check RLS policies are set correctly

3. **Search Not Working**:
   - Check network connectivity
   - Verify API key is set in environment variables
   - Check browser console for errors

### Debug Mode

Enable debug logging by setting:
```bash
NEXT_PUBLIC_DEBUG_LOCATION=true
```

## 📞 Support

For issues or questions:
1. Check the browser console for error messages
2. Verify your API key and database configuration
3. Test with the provided example components
4. Check the network tab for API request failures

## 🔮 Future Enhancements

- **Geolocation Support**: Auto-detect user location
- **Map Integration**: Visual location selection
- **Offline Support**: Service worker for offline functionality
- **Analytics**: Track location search patterns
- **Internationalization**: Multi-language support
- **Advanced Filtering**: Filter by population, type, etc.

---

**Ready to use!** The location system is fully integrated and ready for production use. Start by adding your GeoNames API key and running the database schema.
