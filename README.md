# 🎉 Mavryck Events - Professional Event Management Platform

**Mavryck Events** is a comprehensive, production-ready event management platform built with modern web technologies. This full-stack application provides secure admin management, client interaction capabilities, and robust data handling for professional event planning services.

![Mavryck Events](https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80)

---

## ✨ Features

### 🎨 Frontend Features
- **Modern, responsive UI** with dark theme and smooth animations
- **Interactive event booking system** with real-time form validation
- **Dynamic gallery** with category filtering and lightbox view
- **Service showcase** with detailed descriptions
- **Client testimonials** with star ratings
- **Contact forms** with comprehensive validation
- **Mobile-first design** optimized for all devices
- **Progressive Web App** capabilities

### 🔐 Security Features
- **Secure admin authentication** with Supabase Auth
- **Rate limiting** (5 attempts per 15 minutes)
- **Session management** with 30-minute timeout
- **CSRF protection** with token validation
- **Input validation and sanitization** for all forms
- **SQL injection prevention** with prepared statements
- **XSS protection** with content sanitization
- **Security headers** implementation
- **Activity monitoring** and automatic logout
- **Error boundary** with graceful error handling
- **Production security hardening**

### 🛡️ Admin Dashboard
- **Comprehensive overview** with real-time statistics
- **Event request management** with status tracking
- **Contact message handling** with read/unread status
- **Gallery management** with CRUD operations
- **Product/service management** with pricing
- **Testimonial management** with rating system
- **Advanced data export** to Excel with formatting
- **Backup and restore** functionality
- **Security monitoring** dashboard
- **Settings management** with business configuration

### 🗄️ Database & Backend
- **Supabase integration** for real-time data
- **Row Level Security (RLS)** policies
- **Automated backups** with metadata
- **Data validation** at database level
- **Audit logging** for security events
- **Performance optimization** with indexing
- **Full-text search** capabilities
- **Soft delete** functionality

---

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide Icons** for iconography
- **React Router DOM** for navigation
- **React Hot Toast** for notifications
- **XLSX** for data export functionality

### Backend & Database
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security
- **Real-time subscriptions** for live updates
- **Automated migrations** for schema management

### Security & Validation
- **Supabase Auth** for authentication
- **Input validation** with custom schemas
- **Rate limiting** implementation
- **CSRF protection** mechanisms
- **Security headers** configuration

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### 1. Clone the Repository
```bash
git clone https://github.com/kailash-gupta/mavryck-events.git
cd mavryck-events
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
The database schema will be automatically created when you connect to Supabase. The migrations include:
- Event requests table with status tracking
- Contact messages with read status
- Gallery items with categorization
- Products with pricing information
- Testimonials with ratings
- Event categories and templates
- Vendor management
- Invoice and payment tracking
- Event timeline and milestones
- File attachments
- Audit logging
- Row Level Security policies

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 🚀 Deployment

### Vercel Deployment

This project is optimized for deployment on Vercel:

1. **Connect to Vercel:**
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Vercel will automatically detect the Vite configuration

2. **Environment Variables:**
   Set the following environment variables in your Vercel dashboard:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy:**
   Vercel will automatically build and deploy your application.

### Other Platforms

The application can also be deployed to:
- **Netlify:** Use the same build settings
- **AWS Amplify:** Configure with the Vite build settings
- **Firebase Hosting:** Build and deploy the `dist` folder

---

## 🔑 Admin Access

### Default Admin Credentials
- **Email:** `admin@mavryckevents.com`
- **Password:** Set up through Supabase Auth

### Security Features
- **Rate Limiting:** 5 failed attempts result in 15-minute lockout
- **Session Timeout:** Automatic logout after 30 minutes of inactivity
- **Activity Monitoring:** Real-time tracking of user interactions
- **Secure Password Storage:** Supabase Auth with bcrypt hashing
- **CSRF Protection:** Token-based request validation

---

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── AdminDashboard.tsx    # Main admin interface
│   ├── AdminLogin.tsx        # Secure login form
│   ├── SecurityMiddleware.tsx # Security wrapper
│   ├── ErrorBoundary.tsx     # Error handling
│   └── ...
├── lib/                 # Core libraries
│   ├── auth.ts              # Authentication logic
│   ├── database.ts          # Database operations
│   ├── supabase.ts          # Supabase client
│   └── ...
├── utils/               # Utility functions
│   ├── validation.ts        # Input validation
│   ├── security.ts          # Security utilities
│   └── ...
├── types/               # TypeScript definitions
└── ...

supabase/
├── migrations/          # Database migrations
└── ...
```

---

## 🔒 Security Implementation

### Authentication Security
- **Supabase Auth:** Industry-standard authentication
- **Session Management:** Secure token-based sessions
- **Rate Limiting:** Prevents brute force attacks
- **Input Validation:** Comprehensive sanitization
- **CSRF Protection:** Token validation for all forms

### Database Security
- **Row Level Security:** Granular access control
- **Prepared Statements:** SQL injection prevention
- **Data Validation:** Server-side validation rules
- **Audit Logging:** Security event tracking

### Application Security
- **Content Security Policy:** XSS prevention
- **Security Headers:** OWASP recommended headers
- **Error Handling:** Secure error boundaries
- **Activity Monitoring:** Real-time security tracking

---

## 📊 Admin Dashboard Features

### Overview Dashboard
- **Real-time Statistics:** Event counts, message status, gallery items
- **Recent Activity:** Latest events and messages
- **Quick Actions:** Export, refresh, and navigation

### Event Management
- **Status Tracking:** Pending, ongoing, completed events
- **Client Information:** Contact details and requirements
- **Search & Filter:** Advanced filtering options
- **Bulk Operations:** Export and status updates

### Content Management
- **Gallery Management:** Image upload and categorization
- **Product Management:** Service packages with pricing
- **Testimonial Management:** Client reviews with ratings
- **Settings Configuration:** Business hours and contact info

### Security Dashboard
- **Login Monitoring:** Track authentication attempts
- **Security Metrics:** Failed attempts, lockout status
- **Activity Logs:** Real-time security events
- **System Health:** Security feature status

---

## 📈 Data Export & Backup

### Advanced Export Features
- **Excel Export:** Formatted spreadsheets with styling
- **Date Range Filtering:** Custom time periods
- **Status Filtering:** Filter by event/message status
- **Metadata Inclusion:** Export statistics and summaries
- **Column Optimization:** Auto-sized columns for readability

### Backup & Restore
- **Complete Data Backup:** All tables with relationships
- **Metadata Preservation:** Backup information and statistics
- **Validation on Restore:** Data integrity checks
- **Error Handling:** Detailed error reporting
- **Progress Tracking:** Real-time backup/restore progress

---

## 📱 Responsive Design

### Breakpoints
- **Mobile:** 320px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px - 1439px
- **Large Desktop:** 1440px+

### Features
- **Touch-Friendly:** Optimized for mobile interactions
- **Adaptive Layout:** Content reflows for all screen sizes
- **Performance:** Optimized images and lazy loading
- **Accessibility:** WCAG 2.1 AA compliance

---

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain security standards
- Write comprehensive tests
- Update documentation
- Follow commit message conventions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Built by Tech Trio:**
- **Vimal Chaudhary** - Full Stack Developer
- **Sujal Bhul** - Frontend Developer  
- **Kailash Gupta** - Backend Developer & Project Lead

---

## 📞 Support

For support and inquiries:
- **Email:** mavryckevents@gmail.com
- **Phone:** +91 7045712235
- **Instagram:** [@mavryck_events](https://www.instagram.com/mavryck_events)

---

## 🔄 Version History

### v2.0.0 (Current - Production Ready)
- ✅ Complete security hardening for production
- ✅ Fixed all permission and RLS policy issues
- ✅ Anonymous user access for contact forms and event planning
- ✅ Enhanced database schema with advanced features
- ✅ Comprehensive audit logging and monitoring
- ✅ Full-text search capabilities
- ✅ Soft delete functionality
- ✅ Performance optimization and indexing
- ✅ Production-ready security measures
- ✅ Enhanced error handling and validation
- ✅ Vercel deployment optimization

---

## 🎯 Future Enhancements

- [ ] **Email Integration:** Automated email notifications
- [ ] **Payment Gateway:** Stripe/PayPal integration
- [ ] **Calendar Integration:** Google Calendar sync
- [ ] **Multi-language Support:** Internationalization
- [ ] **Advanced Analytics:** Detailed reporting dashboard
- [ ] **Mobile App:** React Native companion app
- [ ] **API Documentation:** OpenAPI/Swagger docs
- [ ] **Webhook Support:** Third-party integrations

---

**© 2024 Mavryck Events. All rights reserved.**

*Professional event management made simple, secure, and scalable.*