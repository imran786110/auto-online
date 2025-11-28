# ListingItem Component

A modern, responsive car listing card component built with React, Tailwind CSS, and lucide-react icons.

## Features

- **Modern Card Design**: Clean, minimalist card layout with shadow effects and hover animations
- **Responsive Layout**: Fully responsive on mobile, tablet, and desktop devices
- **Image Handling**: Displays car images with fallback to placeholder, supports JSON parsed image arrays
- **Status Badges**: Shows "Verfügbar" (Available) or "Verkauft" (Sold) status
- **Price Formatting**: Displays prices in EUR format with German locale
- **Key Details Display**: Shows mileage, transmission, fuel type, and color
- **Icons**: Uses lucide-react icons (Car and Eye) for visual enhancement
- **Interactive Button**: "Details anzeigen" button with hover effects and Eye icon animation
- **Accessible**: Proper semantic HTML and alt text for images

## Props

| Prop | Type | Description |
|------|------|-------------|
| `listing` | Object | Car listing object (required) |

### Listing Object Structure

```javascript
{
  id: string,              // Unique identifier
  title: string,           // Car title (e.g., "BMW 320i")
  make: string,            // Manufacturer (e.g., "BMW")
  model: string,           // Model (e.g., "320i")
  year: number,            // Year of manufacture
  price: number,           // Price in EUR
  mileage: number,         // Mileage in kilometers
  fuelType: string,        // Fuel type (e.g., "Benzin", "Diesel")
  transmission: string,    // Transmission type (e.g., "Automatik", "Manuell")
  color: string,           // Car color (e.g., "Schwarz", "Weiß")
  category: string,        // Category for routing (e.g., "sale", "rent")
  images: string|Array,    // JSON string or array of image paths
  sold: boolean            // Whether the listing is sold
}
```

## Usage Example

```jsx
import ListingItem from './components/listings/ListingItem';

const listing = {
  id: '1',
  title: 'BMW 320i',
  make: 'BMW',
  model: '320i',
  year: 2020,
  price: 25000,
  mileage: 45000,
  fuelType: 'Benzin',
  transmission: 'Automatik',
  color: 'Schwarz',
  category: 'sale',
  images: '["/uploads/car1.jpg", "/uploads/car2.jpg"]',
  sold: false
};

function App() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ListingItem listing={listing} />
    </div>
  );
}
```

## Styling

The component uses Tailwind CSS classes for all styling. Key styling features:

- **Card Background**: White background with rounded corners and shadow
- **Hover Effect**: Enhanced shadow on hover with smooth transition
- **Image Container**: Responsive height (h-48 on mobile, h-56 on tablets, h-64 on desktop)
- **Status Badge**: Green for available, red for sold
- **Button**: Blue gradient with hover effect

## Image Handling

The component expects images to be passed as:
1. A JSON string: `'["/path/to/image1.jpg", "/path/to/image2.jpg"]'`
2. An array: `["/path/to/image1.jpg", "/path/to/image2.jpg"]`

Images are displayed with the base URL: `http://localhost:5000{imagePath}`

If no valid images are found, a placeholder is displayed and an error is logged to console.

## Responsive Breakpoints

- **Mobile (< 768px)**: Single column, compact padding
- **Tablet (768px - 1024px)**: Two columns, medium padding
- **Desktop (> 1024px)**: Three+ columns, full size

## Accessibility

- Proper `alt` text for car images using make and model
- Semantic HTML structure
- Clear visual indicators for sold/available status
- Readable font sizes and contrast ratios

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- The component is fully responsive and adapts to all screen sizes
- Price formatting uses German locale (de-DE) by default
- The component returns `null` if no listing prop is provided
- Image loading errors are handled gracefully with a placeholder fallback
