import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import DailyMap from '../components/DailyMap';
import { ProtestEvent } from '../types';
import './DailyMapsPage.css';

interface GroupedEvents {
  [date: string]: ProtestEvent[];
}

const DailyMapsPage: React.FC = () => {
  const [events, setEvents] = useState<ProtestEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('2024-12-28');
  const [endDate, setEndDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsRef = collection(db, 'protests');
        let q = query(eventsRef, orderBy('date', 'desc'));

        const querySnapshot = await getDocs(q);
        const eventsData: ProtestEvent[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          eventsData.push({
            id: doc.id,
            ...data,
          } as ProtestEvent);
        });

        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const dateMatch =
        (!start || eventDate >= start) && (!end || eventDate <= end);

      const provinceMatch =
        selectedProvince === 'all' || event.province === selectedProvince;

      const eventTypeMatch =
        selectedEventType === 'all' || event.eventType === selectedEventType;

      return dateMatch && provinceMatch && eventTypeMatch;
    });
  }, [events, selectedProvince, selectedEventType, startDate, endDate]);

  const groupedEvents = useMemo(() => {
    const grouped: GroupedEvents = {};

    filteredEvents.forEach((event) => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    });

    return grouped;
  }, [filteredEvents]);

  const sortedDates = useMemo(() => {
    const dates = Object.keys(groupedEvents);
    return dates.sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b).getTime() - new Date(a).getTime();
      } else {
        return new Date(a).getTime() - new Date(b).getTime();
      }
    });
  }, [groupedEvents, sortOrder]);

  const provinces = useMemo(() => {
    const provinceSet = new Set<string>();
    events.forEach((event) => {
      if (event.province) {
        provinceSet.add(event.province);
      }
    });
    return Array.from(provinceSet).sort();
  }, [events]);

  const eventTypes = useMemo(() => {
    const typeSet = new Set<string>();
    events.forEach((event) => {
      if (event.eventType) {
        typeSet.add(event.eventType);
      }
    });
    return Array.from(typeSet).sort();
  }, [events]);

  const handleReset = useCallback(() => {
    setSelectedProvince('all');
    setSelectedEventType('all');
    setStartDate('2024-12-28');
    setEndDate('');
    setSortOrder('desc');
  }, []);

  const totalEvents = filteredEvents.length;
  const totalDays = sortedDates.length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="daily-maps-page">
        <div className="loading">Loading protest data...</div>
      </div>
    );
  }

  return (
    <div className="daily-maps-page">
      <div className="page-header">
        <h1>Daily Protest Maps</h1>
        <p className="page-description">
          Interactive maps showing the geographic distribution of protests in Iran by date.
          Each map displays the locations and details of protest events for a specific day.
        </p>
      </div>

      <div className="filters-container">
        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="province-filter">Province:</label>
            <select
              id="province-filter"
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
            >
              <option value="all">All Provinces</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="event-type-filter">Event Type:</label>
            <select
              id="event-type-filter"
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
            >
              <option value="all">All Types</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="start-date">Start Date:</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="end-date">End Date:</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="sort-order">Sort Order:</label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          <button className="reset-button" onClick={handleReset}>
            Reset Filters
          </button>
        </div>

        <div className="summary">
          Showing {totalEvents} event{totalEvents !== 1 ? 's' : ''} across {totalDays} day
          {totalDays !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="maps-container">
        {sortedDates.length === 0 ? (
          <div className="no-data">
            No protest events found for the selected filters.
          </div>
        ) : (
          sortedDates.map((date) => {
            const dateEvents = groupedEvents[date];
            const eventCount = dateEvents.length;
            const dateLabel = formatDate(date);

            return (
              <div key={date} className="daily-map-section">
                <div className="date-header">
                  <h2>{dateLabel}</h2>
                  <span className="event-count">
                    {eventCount} event{eventCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="date-summary">
                  On {dateLabel}, there {eventCount === 1 ? 'was' : 'were'}{' '}
                  {eventCount} protest event{eventCount !== 1 ? 's' : ''} recorded
                  {selectedProvince !== 'all' && ` in ${selectedProvince}`}
                  {selectedEventType !== 'all' && ` (${selectedEventType})`}.
                </p>
                <DailyMap events={dateEvents} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DailyMapsPage;