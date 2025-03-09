import { Component } from '@angular/core';

@Component({
  selector: 'landing-component',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  title = 'inventory-management';

  features = [
    {
      title: 'Real-time Tracking',
      description: 'Monitor your inventory levels in real-time with automated updates and alerts.',
      icon: 'activity'
    },
    {
      title: 'Barcode Scanning',
      description: 'Quickly scan items in and out with our mobile-friendly barcode scanning system.',
      icon: 'barcode'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Gain insights into inventory trends with powerful analytics and reporting tools.',
      icon: 'bar-chart-2'
    },
    {
      title: 'Multi-location Support',
      description: 'Manage inventory across multiple warehouses or retail locations from one platform.',
      icon: 'map-pin'
    },
    {
      title: 'Supplier Management',
      description: 'Streamline your supply chain with integrated supplier management and ordering.',
      icon: 'truck'
    },
    {
      title: 'Custom Alerts',
      description: 'Set up custom alerts for low stock, overstock, or other inventory conditions.',
      icon: 'bell'
    }
  ];

  testimonials = [
    {
      quote: 'This inventory system has transformed our warehouse operations. We\'ve reduced errors by 75% and saved countless hours.',
      author: 'Sarah Johnson',
      position: 'Operations Manager, TechSupply Co.',
      image: 'assets/testimonial-1.jpg'
    },
    {
      quote: 'The analytics alone are worth the investment. We\'ve optimized our stock levels and improved cash flow significantly.',
      author: 'Michael Chen',
      position: 'CFO, Retail Solutions Inc.',
      image: 'assets/testimonial-2.jpg'
    },
    {
      quote: 'Implementation was smooth and the support team is incredibly responsive. Best business decision we made this year.',
      author: 'Jessica Rodriguez',
      position: 'Inventory Specialist, Global Distributors',
      image: 'assets/testimonial-3.jpg'
    }
  ];

  plans = [
    {
      name: 'Starter',
      price: '$29',
      period: 'per month',
      features: [
        'Up to 1,000 SKUs',
        'Single location',
        'Basic reporting',
        'Email support',
        '2 user accounts'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Professional',
      price: '$79',
      period: 'per month',
      features: [
        'Up to 10,000 SKUs',
        'Up to 3 locations',
        'Advanced analytics',
        'Priority support',
        '10 user accounts',
        'API access'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      features: [
        'Unlimited SKUs',
        'Unlimited locations',
        'Custom reporting',
        'Dedicated support',
        'Unlimited users',
        'Full API access',
        'Custom integrations'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];
  protected readonly Date = Date;
}

