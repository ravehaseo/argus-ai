# Statistics Calculation in Argus Dashboard

## Overview

The dashboard displays 4 statistics cards:
1. **Total Reviews** - Total count of all reviews for the user
2. **Completed** - Count of reviews with `completed` status
3. **Processing** - Combined count of reviews with `processing` + `pending` status
4. **Failed** - Count of reviews with `failed` status

---

## Backend Calculation (`backend/app/api/v1/reviews.py`)

### Step 1: Get Status Counts (Unfiltered)

The statistics are calculated using a **SQL GROUP BY query** that counts reviews grouped by status:

```python
# Get status counts for stats (unfiltered)
status_counts = db.query(
    Review.status,
    func.count(Review.id).label('count')
).filter(
    Review.user_id == current_user.id
).group_by(Review.status).all()
```

**Key Points:**
- ✅ **Unfiltered**: Stats are calculated from ALL user reviews, regardless of search/filter applied
- ✅ **User-specific**: Only counts reviews belonging to the current user
- ✅ **Database-level**: Uses SQL aggregation for efficiency

### Step 2: Build Stats Dictionary

The query results are converted into a dictionary:

```python
stats = {
    'completed': 0,
    'processing': 0,
    'pending': 0,
    'failed': 0
}
for status_val, count in status_counts:
    if status_val in stats:
        stats[status_val] = count
```

### Step 3: Combine Processing States

The `processing` and `pending` statuses are combined for display:

```python
# Combine processing and pending for display
processing_total = stats.get('processing', 0) + stats.get('pending', 0)
```

**Why combine?**
- Both represent "in-progress" reviews
- Simplifies the UI (one card instead of two)
- More intuitive for users

### Step 4: Return Stats in Response

```python
return {
    "items": [...],  # Paginated reviews
    "total": total,  # Total count (may be filtered)
    "stats": {
        "completed": stats.get('completed', 0),
        "processing": processing_total,  # Combined processing + pending
        "failed": stats.get('failed', 0)
    }
}
```

---

## Frontend Display (`frontend/app/dashboard/page.tsx`)

### Step 1: Receive Stats from API

```typescript
const response = await apiClient.get(`/api/v1/reviews/?${params.toString()}`);
const data = response.data;

if (data.stats) {
  setStats(data.stats);
}
```

### Step 2: Display Stats Cards

```typescript
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  {/* Total Reviews */}
  <div className="bg-white rounded-lg shadow p-4">
    <p className="text-sm text-gray-600">Total Reviews</p>
    <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
  </div>
  
  {/* Completed */}
  <div className="bg-white rounded-lg shadow p-4">
    <p className="text-sm text-gray-600">Completed</p>
    <p className="text-2xl font-bold text-green-600">{stats.completed || 0}</p>
  </div>
  
  {/* Processing (combined processing + pending) */}
  <div className="bg-white rounded-lg shadow p-4">
    <p className="text-sm text-gray-600">Processing</p>
    <p className="text-2xl font-bold text-blue-600">{stats.processing || 0}</p>
  </div>
  
  {/* Failed */}
  <div className="bg-white rounded-lg shadow p-4">
    <p className="text-sm text-gray-600">Failed</p>
    <p className="text-2xl font-bold text-red-600">{stats.failed || 0}</p>
  </div>
</div>
```

---

## Important Notes

### 1. Stats Are Unfiltered

**The statistics are calculated from ALL user reviews**, not just the filtered/paginated results shown in the list.

**Example:**
- User has 100 total reviews
- User searches for "react" → finds 5 reviews
- **Stats still show**: 100 total, 50 completed, 30 processing, 20 failed
- **List shows**: 5 filtered reviews

**Why?**
- Stats provide an overview of the user's entire review history
- Filtered stats would be confusing (what do they represent?)
- Users can see their overall progress at a glance

### 2. Total Reviews vs Stats

- **Total Reviews** (`totalReviews`): May be filtered if search/filter is applied
- **Stats**: Always unfiltered, showing all user reviews

**Example:**
- User has 100 reviews total
- User filters by "completed" status
- **Total Reviews card**: Shows 50 (filtered count)
- **Completed stat**: Shows 50 (unfiltered, but matches by coincidence)
- **Processing stat**: Shows 30 (unfiltered, all processing reviews)

### 3. Processing = Processing + Pending

The "Processing" stat combines two statuses:
- `processing`: Review is actively being analyzed
- `pending`: Review is queued but not yet started

Both represent "in-progress" reviews, so they're combined for simplicity.

---

## SQL Query Breakdown

The actual SQL query executed is:

```sql
SELECT 
    status,
    COUNT(id) as count
FROM reviews
WHERE user_id = :user_id
GROUP BY status
```

**Result Example:**
```
status      | count
------------|------
completed   | 50
processing  | 20
pending     | 10
failed      | 20
```

**After processing:**
```python
stats = {
    'completed': 50,
    'processing': 20,
    'pending': 10,
    'failed': 20
}

processing_total = 20 + 10 = 30  # Combined for display
```

---

## Performance Considerations

### ✅ Efficient
- Single SQL query with GROUP BY
- Database-level aggregation (fast)
- No need to load all reviews into memory

### ⚠️ Potential Optimization
- Could cache stats if needed (but current implementation is already fast)
- Stats query runs on every dashboard load (acceptable for most use cases)

---

## Future Enhancements

Potential improvements:
1. **Cached Stats**: Cache stats for X minutes to reduce database queries
2. **Time-based Stats**: Show stats for last 7 days, 30 days, etc.
3. **Separate Processing/Pending**: Option to show them separately
4. **Real-time Updates**: WebSocket updates for processing reviews
5. **Stats History**: Track stats over time

---

## Summary

**How stats are calculated:**
1. Backend runs SQL `GROUP BY status` query on all user reviews
2. Counts reviews per status (completed, processing, pending, failed)
3. Combines `processing` + `pending` into single "Processing" stat
4. Returns stats in API response (unfiltered)
5. Frontend displays stats in cards

**Key characteristics:**
- ✅ Unfiltered (shows all user reviews, not just filtered results)
- ✅ User-specific (only counts current user's reviews)
- ✅ Efficient (single SQL query)
- ✅ Real-time (calculated on each dashboard load)

