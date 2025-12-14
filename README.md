# SchoolHub Dashboard

A modern, responsive school management dashboard built with React.js and Tailwind CSS. This dashboard provides comprehensive functionality for managing students, teachers, fees, and more.

## Features

### Core Modules

- **Dashboard Home** - Overview with stats, charts, and recent activity
- **Teachers Management** - Add, edit, and manage teaching staff
- **Students Management** - Student information and academic tracking
- **Fees Management** - Fee collection and payment tracking
- **Profile Management** - User profile with personal and professional info
- **Settings** - System configuration and preferences

### Key Features

- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, intuitive interface with beautiful components
- 🔐 **Authentication** - Secure login system with demo credentials
- 📊 **Data Visualization** - Charts and graphs for better insights
- 🔍 **Search & Filter** - Advanced filtering capabilities
- 🌙 **Dark Mode Ready** - Theme switching support
- 🚀 **Performance Optimized** - Fast loading and smooth interactions

## Technology Stack

- **Frontend**: React.js 18
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Routing**: React Router DOM 6
- **API Management**: Custom API service layer

## Installation & Setup

1. **Clone or download the project**

   ```bash
   cd school-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Demo Login Credentials

Use these credentials to access the dashboard:

- **Email**: admin@schoolhub.com
- **Password**: password123

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   └── Login.js              # Login page
│   ├── Dashboard/
│   │   └── Dashboard.js          # Main dashboard
│   ├── Teachers/
│   │   └── Teachers.js           # Teachers management
│   ├── Students/
│   │   └── Students.js           # Students management
│   ├── Fees/
│   │   └── Fees.js               # Fees management
│   ├── Profile/
│   │   └── Profile.js            # User profile
│   ├── Settings/
│   │   └── Settings.js           # System settings
│   └── Layout/
│       └── Layout.js             # Main layout with sidebar
├── services/
│   └── api.js                    # API endpoints and service functions
├── App.js                        # Main app component
├── index.js                      # App entry point
└── index.css                     # Global styles and Tailwind imports
```

## API Integration

The application includes a comprehensive API service layer located in `src/services/api.js`. This file contains:

- **API Endpoints** - Organized by module (auth, dashboard, teachers, students, etc.)
- **HTTP Methods** - GET, POST, PUT, DELETE, PATCH
- **Service Functions** - Ready-to-use functions for each API endpoint
- **Error Handling** - Centralized error handling and token management
- **File Upload** - Support for file uploads

### Example API Usage

```javascript
import { teachersAPI, studentsAPI, feesAPI } from "../services/api";

// Get all teachers
const teachers = await teachersAPI.getAll();

// Create a new student
const newStudent = await studentsAPI.create(studentData);

// Update fee information
const updatedFee = await feesAPI.update(feeId, feeData);
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Customization

### Tailwind Configuration

The design system can be customized in `tailwind.config.js`:

- Colors and themes
- Typography
- Spacing and layout
- Components and utilities

### API Configuration

Update API endpoints in `src/services/api.js`:

- Change base URL
- Add new endpoints
- Modify authentication logic

## Production Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your preferred hosting service:
   - Netlify
   - Vercel
   - AWS S3
   - Traditional web hosting

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:

- Check the documentation
- Review the code comments
- Open an issue on GitHub

---

**Built with ❤️ using React.js and Tailwind CSS**
# School-dashboard
