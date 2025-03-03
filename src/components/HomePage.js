// HomePage.js
import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Button,
  useTheme,
  useMediaQuery,
  Fade,
  Card,
  CardMedia,
  CardContent,
  Avatar,
  Divider,
  Chip,
  IconButton
} from '@mui/material';
import { 
  ArrowForward, 
  LocalFlorist, 
  EmojiNature, 
  Handshake,
  Article,
  ShoppingBasket,
  Storefront,
  LocalShipping,
  KeyboardArrowRight,
  Star,
  Instagram,
  Facebook,
  Twitter,
  LinkedIn,
  ArrowDownward,
  Public,
  MonetizationOn,
  People
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FeaturedFarms from './FeaturedFarms';
import '../Styles/HomePage.css';

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const FeatureCard = ({ icon: Icon, title, description }) => (
    <Paper 
      elevation={2}
      className="feature-card"
    >
      <Box className="feature-icon-container">
        <Icon sx={{ fontSize: 40, color: 'white' }} />
      </Box>
      <Typography 
        variant="h6" 
        gutterBottom 
        className="feature-title"
      >
        {title}
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary" 
        className="feature-description"
      >
        {description}
      </Typography>
    </Paper>
  );

  const Process = ({ number, title, description }) => (
    <Box className="process-step">
      <Box className="process-number">
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
          {number}
        </Typography>
      </Box>
      <Box className="process-content">
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Box>
  );

  const TestimonialCard = ({ quote, author, role, avatar }) => (
    <Card className="testimonial-card">
      <CardContent sx={{ flex: 1, pt: 2 }}>
        <Typography className="testimonial-quote">
          "{quote}"
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={avatar} 
            alt={author}
            className="testimonial-avatar"
          />
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {author}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {role}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const FeaturedFarmerCard = ({ image, farmName, description, products, location }) => (
    <Card className="farmer-card">
      <CardMedia
        component="img"
        height="180"
        image={image}
        alt={farmName}
      />
      <CardContent sx={{ flex: 1, p: 3 }}>
        <Typography 
          variant="h6" 
          component="h3" 
          gutterBottom
          className="farmer-title"
        >
          {farmName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Chip 
            icon={<Public fontSize="small" />}
            label={location} 
            size="small" 
            className="farmer-location"
          />
        </Box>
        <Typography 
          variant="body2" 
          color="text.secondary"
          className="farmer-description"
          sx={{ mb: 2 }}
        >
          {description}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {products.map((product, idx) => (
            <Chip 
              key={idx}
              label={product} 
              size="small" 
              variant="outlined"
              className="product-tag"
            />
          ))}
        </Box>
        <Button
          endIcon={<KeyboardArrowRight />}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          View Farm Profile
        </Button>
      </CardContent>
    </Card>
  );

  const SuccessStoryCard = ({ image, title, excerpt, impact }) => (
    <Card className="success-story-card">
      <CardMedia
        component="img"
        height="180"
        image={image}
        alt={title}
      />
      <CardContent sx={{ flex: 1, p: 3 }}>
        <Typography 
          variant="h6" 
          component="h3" 
          gutterBottom
          className="story-title"
        >
          {title}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          className="story-excerpt"
          sx={{ mb: 2 }}
        >
          {excerpt}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
          <MonetizationOn sx={{ color: 'success.main', mr: 1 }} />
          <Typography variant="body2" fontWeight="medium" color="success.main">
            {impact}
          </Typography>
        </Box>
        <Button
          endIcon={<KeyboardArrowRight />}
          sx={{
            mt: 2,
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Read Full Story
        </Button>
      </CardContent>
    </Card>
  );

  const scrollToFeatures = () => {
    document.getElementById('mission').scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box className="hero-section">
        <Box className="hero-background"></Box>
        
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography 
                    variant={isMobile ? "h3" : "h1"} 
                    component="h1" 
                    className="hero-title"
                  >
                    Your Local Farmers' Market, Online
                  </Typography>
                  <Typography 
                    variant="h5" 
                    className="hero-subtitle"
                  >
                    Connecting local farms directly with wholesale buyers - because food grown in your community should stay in your community
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 5 }}>
                    <Button
                      variant="contained"
                      size="large"
                      className="btn-get-started"
                      onClick={() => navigate('/Register')}
                    >
                      Join Our Community
                    </Button>
                    <Button
                      variant="outlined" 
                      size="large"
                      className="btn-learn-more"
                      onClick={() => navigate('/MissionStatement')}
                    >
                      How It Works
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ color: 'white', mr: 3 }}>
                      Supporting 500+ Local Farms
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                      {[1, 2, 3, 4, 5].map((_, index) => (
                        <Star key={index} sx={{ color: '#FFD700', fontSize: 20 }} />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Fade in timeout={1500}>
                <Box className="hero-image-container">
                  <Box className="hero-main-image"></Box>
                  <Box className="hero-secondary-image"></Box>
                </Box>
              </Fade>
            </Grid>
          </Grid>
          <Box className="scroll-indicator-container">
            <IconButton
              onClick={scrollToFeatures}
              className={`scroll-indicator ${scrolled ? '' : 'bounce'}`}
            >
              <ArrowDownward sx={{ color: 'primary.main' }} />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* Key Stats */}
      <Box className="stats-section">
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            {[
              { number: '60%', label: 'Higher Farmer Profits' },
              { number: '24hrs', label: 'Marketplace Onboarding' },
              { number: '500+', label: 'Local Farms Connected' },
              { number: '80%', label: 'Reduction in Food Miles' }
            ].map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Box className="stat-box">
                  <Typography 
                    variant="h3" 
                    className="stat-number"
                  >
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Mission Statement */}
      <Container id="mission" maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box className="mission-image"></Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography className="section-overline">
              OUR MISSION
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom
              className="section-title"
            >
              Community-Powered Agriculture
            </Typography>
            <Typography className="section-text">
              At Elipae, we believe food grown in your community should stay in your community. Our online farmers' market connects local farms directly with wholesale buyers, cutting out corporate middlemen who ship produce thousands of miles and shortchange farmers.
            </Typography>
            <Typography className="section-text">
              We're creating a more sustainable food system where farmers earn fair prices, buyers access fresher produce, communities thrive, and our environmental footprint shrinks dramatically. By keeping food local, we're transforming how America eats—one community at a time.
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              className="btn-primary"
              onClick={() => navigate('/MissionStatement')}
            >
              Read More
            </Button>
          </Grid>
        </Grid>
      </Container>

      {/* Features */}
      <Box id="features" className="features-section">
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography className="section-overline">
              WHY LOCAL MATTERS
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              className="section-title"
            >
              A Better Way To Feed Communities
            </Typography>
            <Typography className="section-subtitle">
              We're revolutionizing the wholesale food supply chain by putting farmers and local buyers first
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={MonetizationOn}
                title="Fair Prices For Farmers"
                description="Farmers earn up to 60% more by selling directly to local buyers, eliminating corporate middlemen"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={Storefront}
                title="Community Marketplace"
                description="Our platform creates a true online farmers' market, connecting local farms with buyers who value freshness and quality"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={People}
                title="Stronger Communities"
                description="When dollars stay local, communities thrive—creating jobs and building resilient local food networks"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={LocalFlorist}
                title="Fresher Food"
                description="Produce reaches tables within days, not weeks, preserving flavor, nutrition, and reducing waste"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={EmojiNature}
                title="Environmental Benefits"
                description="Reducing food miles by 80% compared to traditional supply chains, dramatically cutting emissions"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={LocalShipping}
                title="Simplified Logistics"
                description="Our local delivery network handles everything from farm to buyer, making the process seamless"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography className="section-overline">
              HOW IT WORKS
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom
              className="section-title"
            >
              From Farm To Wholesale In 4 Simple Steps
            </Typography>
            
            <Process 
              number="1"
              title="Join Our Community"
              description="Create your profile in minutes, sharing your farm's story and what makes your produce special."
            />
            <Process 
              number="2"
              title="List Your Products"
              description="Upload what you're growing, set your wholesale prices,What you have as surplus , and share high-quality images."
            />
            <Process 
              number="3"
              title="Connect With Buyers"
              description="Local restaurants, grocers, and food co-ops browse and purchase directly from your farm."
            />
            <Process 
              number="4"
              title="Grow Your Business"
              description="We handle delivery logistics while you build lasting relationships with local buyers."
            />
            
            <Button
              variant="contained"
              size="large"
              className="btn-primary"
              onClick={() => navigate('/Register')}
            >
              Start Selling Locally
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative' }}>
              <Box className="process-image"></Box>
              <Box className="process-badge">
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                  Local<br/>Impact
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
      
      {/* Testimonials */}
      <Box className="testimonials-section">
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              className="testimonials-title"
            >
              Voices From Our Community
            </Typography>
            <Typography className="testimonials-subtitle">
              Hear from farmers who have transformed their businesses by keeping food local
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <TestimonialCard 
                quote="After 15 years of selling to distributors who dictated my prices, I'm finally earning what my produce is worth. And my customers are just 20 miles away!"
                author="Sarah Johnson"
                role="Berry Hill Farm, Oregon"
                avatar="/api/placeholder/60/60"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TestimonialCard 
                quote="I was ready to sell my family farm until I joined Elipae. Now I supply three local restaurants and two markets, making double what I did before."
                author="Michael Torres"
                role="Sunshine Organics, California"
                avatar="/api/placeholder/60/60"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TestimonialCard 
                quote="The big corporations wouldn't even talk to a small farm like mine. Now I'm the preferred supplier for the best restaurants in town - they love telling customers their food comes from 10 miles away."
                author="Emily Chen"
                role="Green Valley Farms, Washington"
                avatar="/api/placeholder/60/60"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Farmers Section - Replacing Featured Articles */}
      <Box className="featured-farms-section">
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography className="section-overline">
              COMMUNITY SPOTLIGHT
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              className="section-title"
            >
              Meet This Week's Featured Farmers
            </Typography>
            <Typography className="section-subtitle">
              Every week we highlight exceptional farmers whose products are making waves in their local communities
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <FeaturedFarmerCard 
                image="/api/placeholder/400/180"
                farmName="Riverside Organic Dairy"
                location="Lancaster County, PA"
                description="Third-generation family farm producing award-winning artisanal cheeses and yogurts from grass-fed Jersey cows."
                products={["Artisan Cheese", "Yogurt", "Grass-Fed Butter"]}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeaturedFarmerCard 
                image="/api/placeholder/400/180"
                farmName="Hillside Berry Patch"
                location="Hudson Valley, NY"
                description="Specializing in rare berry varieties grown using regenerative farming methods, supplying top restaurants within 30 miles."
                products={["Heirloom Berries", "Jams", "Berry Plants"]}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeaturedFarmerCard 
                image="/api/placeholder/400/180"
                farmName="Veterans Victory Gardens"
                location="Sonoma County, CA"
                description="Veteran-owned cooperative growing premium heirloom vegetables and training fellow veterans in sustainable agriculture."
                products={["Heirloom Tomatoes", "Specialty Greens", "Culinary Herbs"]}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              endIcon={<KeyboardArrowRight />}
              onClick={() => navigate('/farmers')}
            >
              Explore All Community Farmers
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* Success Stories */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography className="section-overline">
            IMPACT STORIES
          </Typography>
          <Typography 
            variant="h3" 
            component="h2" 
            className="section-title"
          >
            Local Success Stories
          </Typography>
          <Typography className="section-subtitle">
            Real stories of how keeping food local transforms farms, businesses, and communities
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <SuccessStoryCard 
              image="/api/placeholder/400/180"
              title="How Green Valley Farm Saved Their 80-Year Legacy"
              excerpt="Facing bankruptcy after decades of corporate exploitation, this small farm found new life by connecting with local businesses through our platform."
              impact="Revenue increased 85% in six months"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SuccessStoryCard 
              image="/api/placeholder/400/180"
              title="From Farm to School: Feeding 3,000 Children Daily"
              excerpt="See how we helped Bridge County School District replace processed foods with fresh produce from farms within 25 miles of their cafeterias."
              impact="Improved nutrition while saving $27,000 annually"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SuccessStoryCard 
              image="/api/placeholder/400/180"
              title="The Restaurant That Built a Micro-Economy"
              excerpt="Chef Maria Diaz sources 100% locally through our platform, creating demand that helped five farms expand and hire 23 new employees."
              impact="Created 30+ new jobs in one rural community"
            />
          </Grid>
        </Grid>
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            endIcon={<KeyboardArrowRight />}
            onClick={() => navigate('/success-stories')}
          >
            Read More Success Stories
          </Button>
        </Box>
      </Container>
      
      {/* Call to Action */}
      <Box className="cta-section">
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom
              className="cta-title"
            >
              Join The Local Food Revolution
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ mb: 4 }}
              className="cta-subtitle"
            >
              Whether you're a farmer or a wholesale buyer, you can help transform how communities eat
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                className="btn-primary"
                onClick={() => navigate('/Register')}
              >
                Join As A Farmer
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/Register')}
              >
                Join As A Buyer
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;