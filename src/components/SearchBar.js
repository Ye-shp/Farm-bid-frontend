import React, { useState } from 'react';
import axios from 'axios';

const SearchBar = () => {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [delivery, setDelivery] = useState(false);
  const [wholesale, setWholesale] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState(50);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    try {
      setError('');
      const queryParams = new URLSearchParams({
        keyword,
        category,
        delivery: delivery.toString(),
        wholesale: wholesale.toString(),
        latitude,
        longitude,
        radius,
      });

      const response = await axios.get(`/api/search/farms?${queryParams}`);
      setResults(response.data);
    } catch (err) {
      setError('Failed to fetch results. Please try again.');
    }
  };

  return (
    <div>
      <h2>Search Farms</h2>
      <div>
        <input
          type="text"
          placeholder="Keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <label>
          Delivery Available
          <input
            type="checkbox"
            checked={delivery}
            onChange={(e) => setDelivery(e.target.checked)}
          />
        </label>
        <label>
          Wholesale Available
          <input
            type="checkbox"
            checked={wholesale}
            onChange={(e) => setWholesale(e.target.checked)}
          />
        </label>
        <input
          type="text"
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
        />
        <input
          type="text"
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
        />
        <input
          type="number"
          placeholder="Radius (km)"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <h3>Results:</h3>
        {results.length === 0 && <p>No results found.</p>}
        {results.map((result) => (
          <div key={result._id}>
            <h4>{result.title}</h4>
            <p>{result.user.name}</p>
            <p>{result.user.location.latitude}, {result.user.location.longitude}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
