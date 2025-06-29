import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Mavryck Events - Professional Event Management by Kailash Gupta | Mumbai",
  description = "Professional event planning and management services by Kailash Gupta in Mumbai. Specializing in corporate events, weddings, birthdays, festivals, galas, and anniversaries. Contact +91 7045712235 for unforgettable events.",
  keywords = "event management, event planning, wedding planner, corporate events, birthday parties, festival events, Mumbai events, Kailash Gupta, Mavryck Events, event organizer, party planner, anniversary celebrations, gala dinners",
  image = "https://mavryckevents.com/kailash-gupta.jpg",
  url = "https://mavryckevents.com/",
  type = "website",
  noindex = false
}) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Robots */}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Mavryck Events" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:creator" content="@mavryck_events" />
      
      {/* Additional SEO tags */}
      <meta name="author" content="Kailash Gupta - Mavryck Events" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="IN-MH" />
      <meta name="geo.placename" content="Mumbai, Maharashtra, India" />
      <meta name="contact" content="mavryckevents@gmail.com" />
      <meta name="phone" content="+91 7045712235" />
    </Helmet>
  );
};

export default SEOHead;