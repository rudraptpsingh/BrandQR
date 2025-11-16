# QR Code Generator

A minimal, scalable QR code generator web application built with React and Vite.

## Features

- Instant QR code generation from URLs
- Real-time validation of URL inputs
- Download QR codes as PNG images
- Fully responsive design (mobile, tablet, desktop)
- Clean, professional UI suitable for MVP
- Accessible design with ARIA labels

## Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **QR Code Library:** qrcode.js
- **Styling:** Pure CSS

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be generated in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

1. Enter a valid URL (must start with http:// or https://) in the input field
2. Click "Generate QR" button or press Enter
3. View the generated QR code
4. Click "Download QR Code" to save the image

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── QRGenerator.jsx    # Main QR generator component
│   │   └── QRGenerator.css    # Component styles
│   ├── App.jsx                 # Root component
│   ├── App.css                 # App styles
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global styles
├── index.html                  # HTML template
├── vite.config.js              # Vite configuration
└── package.json                # Dependencies and scripts
```

## Deployment

This application can be deployed to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Google Cloud Storage

Simply run `npm run build` and deploy the contents of the `dist` directory