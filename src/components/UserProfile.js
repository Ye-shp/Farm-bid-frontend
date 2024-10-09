import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`https://your-api-endpoint.com/api/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, [userId]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>{user.email}</h2>
      <p>Role: {user.role}</p>
      <p>Location: {user.location.latitude}, {user.location.longitude}</p>

      {user.partners && (
        <div>
          <h3>Partners</h3>
          <ul>
            {user.partners.map((partner, index) => (
              <li key={index}>
                <h5>{partner.name}</h5>
                <p>{partner.location}</p>
                <p>{partner.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
