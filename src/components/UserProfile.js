import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState({
    socialMedia: { instagram: '', facebook: '', tiktok: '' },
    description: '',
    wholesaleAvailable: false,
    deliveryAvailable: false,
    location: { latitude: '', longitude: '' },
    partners: [],
    followers: [],
    following: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
    const userIdFromToken = localStorage.getItem('userId');
    setLoggedInUserId(userIdFromToken);

    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `https://farm-bid-3998c30f5108.herokuapp.com/api/users/${userId}`
        );
        const fetchedUser = response.data;

        setUser({
          ...fetchedUser,
          socialMedia: fetchedUser.socialMedia || { instagram: '', facebook: '', tiktok: '' },
          location: fetchedUser.location || { latitude: '', longitude: '' },
          partners: fetchedUser.partners || [],
          followers: fetchedUser.followers || [],
          following: fetchedUser.following || [],
          deliveryAvailable: fetchedUser.deliveryAvailable || false,
        });

        // Check if the logged-in user is already following this user
        setIsFollowing(fetchedUser.followers.includes(userIdFromToken));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, [userId]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `https://farm-bid-3998c30f5108.herokuapp.com/api/users/${userId}`,
        {
          wholesaleAvailable: user.wholesaleAvailable,
          deliveryAvailable: user.deliveryAvailable,
          description: user.description,
          socialMedia: user.socialMedia,
          partners: user.partners,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
    }
  };

  const handlePartnerChange = (index, field, value) => {
    const updatedPartners = [...user.partners];
    updatedPartners[index] = { ...updatedPartners[index], [field]: value };
    setUser({ ...user, partners: updatedPartners });
  };

  const addNewPartner = () => {
    setUser({
      ...user,
      partners: [...user.partners, { name: '', location: '', description: '' }],
    });
  };

  const handleFollow = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `https://farm-bid-3998c30f5108.herokuapp.com/api/users/follow/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsFollowing(true);
      setUser((prevUser) => ({
        ...prevUser,
        followers: [...prevUser.followers, loggedInUserId],
      }));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `https://farm-bid-3998c30f5108.herokuapp.com/api/users/unfollow/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsFollowing(false);
      setUser((prevUser) => ({
        ...prevUser,
        followers: prevUser.followers.filter((id) => id !== loggedInUserId),
      }));
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const isOwner = loggedInUserId === userId;

  return (
    <div className="container mt-4">
      <div className="user-card card shadow-sm p-3 mb-4">
        <h2 className="user-email mb-2">{user.username}</h2>
        <p>
          <strong>Location:</strong>{' '}
          {/*{user.location.latitude && user.location.longitude
            ? `${user.location.latitude}, ${user.location.longitude}`
            : 'Location not available'}*/}
        </p>
        <p>Followers: {user.followers.length}</p>
        <p>Following: {user.following.length}</p>
      </div>

      {user.role === 'farmer' && (
        <>
          <div className="about-card card shadow-sm p-3 mb-4">
            <h3>About Me</h3>
            {isEditing ? (
              <textarea
                value={user.description || ''}
                onChange={(e) =>
                  setUser({ ...user, description: e.target.value })
                }
                className="form-control"
                rows="3"
              />
            ) : (
              <p>{user.description || 'No description provided yet.'}</p>
            )}
          </div>

          <div className="social-media-card card shadow-sm p-3 mb-4">
            <h3>Social Media</h3>
            {isEditing ? (
              <div className="social-media-inputs">
                <input
                  type="text"
                  value={user.socialMedia.instagram || ''}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      socialMedia: {
                        ...user.socialMedia,
                        instagram: e.target.value,
                      },
                    })
                  }
                  placeholder="Instagram"
                  className="form-control mb-2"
                />
                <input
                  type="text"
                  value={user.socialMedia.facebook || ''}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      socialMedia: {
                        ...user.socialMedia,
                        facebook: e.target.value,
                      },
                    })
                  }
                  placeholder="Facebook"
                  className="form-control mb-2"
                />
                <input
                  type="text"
                  value={user.socialMedia.tiktok || ''}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      socialMedia: {
                        ...user.socialMedia,
                        tiktok: e.target.value,
                      },
                    })
                  }
                  placeholder="TikTok"
                  className="form-control mb-2"
                />
              </div>
            ) : (
              <div className="social-media-links">
                {user.socialMedia.instagram && (
                  <a href={user.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary mb-2">
                    Instagram
                  </a>
                )}
                {user.socialMedia.facebook && (
                  <a href={user.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary mb-2">
                    Facebook
                  </a>
                )}
                {user.socialMedia.tiktok && (
                  <a href={user.socialMedia.tiktok} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary mb-2">
                    TikTok
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="partners-card card shadow-sm p-3 mb-4">
            <h3>Partners</h3>
            {isEditing ? (
              <>
                {user.partners.map((partner, index) => (
                  <div key={index} className="partner-input mb-3">
                    <input
                      type="text"
                      value={partner.name || ''}
                      onChange={(e) =>
                        handlePartnerChange(index, 'name', e.target.value)
                      }
                      placeholder="Partner Name"
                      className="form-control mb-1"
                    />
                    <input
                      type="text"
                      value={partner.location || ''}
                      onChange={(e) =>
                        handlePartnerChange(index, 'location', e.target.value)
                      }
                      placeholder="Location"
                      className="form-control mb-1"
                    />
                    <input
                      type="text"
                      value={partner.description || ''}
                      onChange={(e) =>
                        handlePartnerChange(index, 'description', e.target.value)
                      }
                      placeholder="Description"
                      className="form-control"
                    />
                  </div>
                ))}
                <button className="btn btn-secondary mt-2" onClick={addNewPartner}>
                  Add New Partner
                </button>
              </>
            ) : (
              <ul className="list-unstyled">
                {user.partners.length > 0 ? (
                  user.partners.map((partner, index) => (
                    <li key={index} className="mb-3">
                      <strong>{partner.name}</strong> - {partner.location}
                      <br />
                      <em>{partner.description}</em>
                    </li>
                  ))
                ) : (
                  <p>No partners listed yet.</p>
                )}
              </ul>
            )}
          </div>
          <div className="delivery-card card shadow-sm p-3 mb-4">
            <h3>Delivery Availability</h3>
            {isEditing ? (
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="deliveryAvailable"
                  checked={user.deliveryAvailable || false}
                  onChange={(e) => setUser({ ...user, deliveryAvailable: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="deliveryAvailable">
                  Offers Delivery
                </label>
              </div>
            ) : (
              <p>
                {user.deliveryAvailable
                  ? 'This farmer offers delivery.'
                  : 'Delivery not available.'}
              </p>
            )}
          </div>
          <div className="wholesale-card card shadow-sm p-3 mb-4">
            <h3>Wholesale Availability</h3>
            {isEditing ? (
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="wholesaleAvailable"
                  checked={user.wholesaleAvailable || false}
                  onChange={(e) =>
                    setUser({ ...user, wholesaleAvailable: e.target.checked })
                  }
                />
                <label className="form-check-label" htmlFor="wholesaleAvailable">
                  Offers Wholesale
                </label>
              </div>
            ) : (
              <p>
                {user.wholesaleAvailable
                  ? 'This farmer offers wholesale.'
                  : 'Wholesale not available.'}
              </p>
            )}
          </div>

          {isOwner ? (
            <div className="action-buttons mt-3">
              <button className="btn btn-primary me-2" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
              {isEditing && (
                <button className="btn btn-success" onClick={handleSave}>
                  Save Changes
                </button>
              )}
            </div>
          ) : (
            <div className="follow-buttons mt-3">
              <button
                className={`btn ${isFollowing ? 'btn-danger' : 'btn-primary'}`}
                onClick={isFollowing ? handleUnfollow : handleFollow}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserProfile;
