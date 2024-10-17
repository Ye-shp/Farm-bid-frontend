import React from 'react';
import '../Styles/HomePage.css';

const HomePage = () => (
  <div className="container text-center my-5">
      <header className="py-5 bg-primary text-white rounded shadow">
      <h1 className="display-4 fw-bold">Welcome to Elipae Marketplace</h1>
      <p className="lead">Bid on fresh produce directly from local farmers.</p>
    </header>

    <section className="my-5 p-5 bg-light rounded shadow">
      <h2 className="mb-4">Elipae</h2>
      <p className="lead">At Elipae, we empower farmers by transforming surplus into opportunity. Our platform connects local farmers with buyers, ensuring fair pricing and reducing waste. We’re building a sustainable future where communities thrive through transparent, accessible, and efficient agricultural commerce."

"Looking for more? Check out this week’s featured farms in the USA and discover their stories, innovations, and produce. Stay connected with the heart of America’s agriculture!.</p>
    </section>

   {/*Featured blogs*/}
    <section className="my-5">
      <h2 className="mb-4">This weeks farms</h2>
      <div className="embed-responsive embed-responsive-16by9">
       {/*<iframe
          className="embed-responsive-item"
          src="https://www.google.com/maps/d/embed?mid=1sEtufBsicCwZVucez3fAHTdsGumzAy4&ehbc=2E312F"
          width="640"
          height="480"
          allowFullScreen
        ></iframe>*/}

      </div>
    </section>
  </div>
);

export default HomePage;
