import React from 'react';
import '../Styles/MissionStatement.css';

const MissionStatement = () => {
    return (
        <div className="mission-statement-container">
            <section className="about-section">
                <h1>About Elipae</h1>
                
                <div className="about-subsection">
                    <h2>Who We Are</h2>
                    <p>
                        Elipae is a groundbreaking digital marketplace revolutionizing how wholesale buyers 
                        connect with local farmers. Born from a vision to transform the traditional food supply chain, 
                        we've created a platform that eliminates unnecessary intermediaries and brings transparency 
                        to an industry long defined by opacity and disconnection.
                    </p>
                    <p>
                        Our team combines expertise in agriculture, technology, and supply chain management 
                        with a shared passion for sustainable food systems. We believe that the future of food 
                        is local, transparent, and relationship-driven—where buyers know exactly where their 
                        produce comes from and farmers receive fair compensation for their hard work.
                    </p>
                </div>
                
                <div className="about-subsection">
                    <h2>What We Do</h2>
                    <p>
                        Elipae's platform creates a hyper-localized food ecosystem that serves large wholesale 
                        buyers—restaurants, organic grocery stores, schools, and specialty sellers—by connecting 
                        them directly with farmers in their region.
                    </p>
                    
                    <p>Our technology enables:</p>
                    <ul>
                        <li><strong>Direct connections</strong> between wholesale buyers and local farmers</li>
                        <li><strong>Transparent transactions</strong> through our innovative marketplace</li>
                        <li><strong>Efficient inventory management</strong> that reduces food waste</li>
                        <li><strong>Fresh, seasonal produce</strong> procurement at competitive prices</li>
                        <li><strong>Story-rich relationships</strong> that bring meaning back to food sourcing</li>
                    </ul>
                    
                    <p>
                        Through our auction system, farmers can sell surplus produce directly to buyers, 
                        increasing their revenue while reducing waste. Our contract creation tools provide 
                        farmers with reliable markets for their produce while ensuring consistent supply for buyers.
                    </p>
                    
                    <p>
                        What truly sets us apart is our commitment to storytelling. Elipae's platform allows 
                        farmers and buyers to share their experiences and connect on a deeper level, creating 
                        a food ecosystem built on relationships, not just transactions.
                    </p>
                </div>

                <div className="benefits-section">
                    <h2>The Power of Hyper-Local Sourcing</h2>
                    
                    <div className="benefits-columns">
                        <div className="benefits-column">
                            <h3>Benefits for Farmers</h3>
                            <ul>
                                <li>Increased revenue through direct sales</li>
                                <li>Reduced transportation costs</li>
                                <li>Support for sustainable farming practices</li>
                                <li>Stronger community connections</li>
                                <li>Brand building through storytelling</li>
                            </ul>
                        </div>
                        
                        <div className="benefits-column">
                            <h3>Benefits for Wholesale Buyers</h3>
                            <ul>
                                <li>Access to fresher, higher-quality produce</li>
                                <li>Reduced food waste</li>
                                <li>Unique menu offerings and seasonal specialties</li>
                                <li>Cost savings through optimized procurement</li>
                                <li>Enhanced sustainability credentials</li>
                                <li>Increased community engagement</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div className="about-subsection">
                    <h2>Our Scholarship Program</h2>
                    <p>
                        We're committed to empowering the next generation of agricultural innovators through 
                        our unique scholarship program for high school students. Here's how it works:
                    </p>
                    
                    <p>
                        Students who help farmers transition to the Elipae platform receive all the revenue 
                        Elipae would normally earn from those farms. This innovative approach gives students 
                        real-world business experience while creating meaningful connections between young 
                        entrepreneurs and local agricultural communities.
                    </p>
                    
                    <p>The program offers students the opportunity to:</p>
                    <ul>
                        <li>Build professional relationships with local farmers</li>
                        <li>Gain hands-on experience in agricultural technology</li>
                        <li>Develop valuable business and communication skills</li>
                        <li>Earn income based on their direct impact and effort</li>
                        <li>Contribute to building a more sustainable local food system</li>
                    </ul>
                    
                    <p>
                        <a href="./students" className="scholarship-link">
                            Interested students can sign up for our scholarship program here
                        </a>
                    </p>
                </div>
                
                <div className="mission-vision-section">
                    <div className="mission-statement">
                        <h2>Our Mission</h2>
                        <blockquote>
                            To empower large wholesale food buyers and local farmers by creating a transparent 
                            and sustainable hyper-localized marketplace. We connect communities through storytelling, 
                            fostering relationships that ensure the freshest, highest-quality produce while 
                            maximizing value for all.
                        </blockquote>
                    </div>
                    
                    <div className="vision-statement">
                        <h2>Our Vision</h2>
                        <p>
                            We envision a future where food systems are resilient, equitable, and community-centered. 
                            Where wholesale buyers have direct relationships with the farmers who grow their food. 
                            Where farmers receive fair prices and recognition for their work. Where communities 
                            thrive through stronger local food economies.
                        </p>
                        <p>
                            By bridging the gap between farmers and wholesale buyers, Elipae isn't just changing 
                            how food is bought and sold—we're rebuilding the foundation of our food system from 
                            the ground up.
                        </p>
                    </div>
                </div>

                <div className="about-subsection">
                    <h2>What Makes Us Different</h2>
                    <p>
                        Unlike other platforms in this space, Elipae focuses specifically on wholesale buyers with 
                        unique needs. While companies like Full Harvest concentrate on minimizing food waste through 
                        surplus produce, and Local Harvest connects producers with general consumers, Elipae 
                        creates a specialized marketplace that addresses the specific challenges of large-scale 
                        wholesale food procurement:
                    </p>
                    <ul>
                        <li><strong>Maintaining product freshness</strong> through shorter supply chains</li>
                        <li><strong>Streamlining inventory management</strong> with direct farmer relationships</li>
                        <li><strong>Improving profit margins</strong> by reducing intermediaries</li>
                        <li><strong>Ensuring safety and compliance</strong> through transparency</li>
                        <li><strong>Meeting evolving customer expectations</strong> for sustainable, local sourcing</li>
                    </ul>
                    <p>
                        Our platform integrates advanced technology with the human element of food systems, creating 
                        a solution that is both efficient and relationship-driven—a combination rarely found in 
                        agricultural technology.
                    </p>
                </div>
            </section>
        </div>
    );
}

export default MissionStatement;