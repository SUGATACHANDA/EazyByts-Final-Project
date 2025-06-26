const events = [
    {
        title: 'Modern Web Dev Conference',
        description: 'Join thousands of developers for a deep dive into React, Node, and more. Features talks from industry leaders.',
        date: new Date('2024-10-22T09:00:00'),
        location: 'Online',
        price: 99.99,
        totalTickets: 500,
        availableTickets: 500, // Initially, all tickets are available
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop',
    },
    {
        title: 'Ultimate Tailwinder CSS Workshop',
        description: 'Master Tailwind CSS from scratch. Build beautiful, modern UIs without ever leaving your HTML.',
        date: new

            Date('2024-11-05T10:00:00'),
        location: 'San Francisco, CA',
        price: 149.00,
        totalTickets: 100,
        availableTickets: 100,
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
    },
    {
        title: 'The Future of AI in Tech',
        description: 'An exclusive summit exploring the latest trends and future impact of Artificial Intelligence.',
        date: new

            Date('2024-11-18T09:30:00'),
        location: 'New York, NY',
        price: 299.00,
        totalTickets: 250,
        availableTickets: 250,
        image: 'https://images.unsplash.com/photo-1620712943543-95fc69afd524?q=80&w=2070&auto=format&fit=crop',
    },
];

module.exports = events;