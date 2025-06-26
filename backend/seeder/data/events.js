// Helper to get future dates
const getFutureDate = (days) => {
    const future = new Date();
    future.setDate(future.getDate() + days);
    return future;
};

const events = [
    {
        name: 'React Forward Conference 2024',
        description:
            'Join the brightest minds in the React ecosystem for three days of talks, workshops, and networking. Discover the latest trends and techniques in React, Next.js, and more.',
        date: getFutureDate(30),
        location: 'Online',
        imageUrl: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        price: 99.00,
        totalTickets: 200,
    },
    {
        name: 'Vue.js Global Summit',
        description:
            'A global summit for Vue.js developers. Explore the future of Vue with Evan You and core team members. Dive deep into Vue 3, Pinia, and Vite.',
        date: getFutureDate(45),
        location: 'Amsterdam, NL',
        imageUrl: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        price: 149.50,
        totalTickets: 150,
    },
    {
        name: 'Node.js Performance Workshop',
        description:
            'A hands-on workshop focused on optimizing Node.js applications. Learn about event loop, memory management, and scaling your services.',
        date: getFutureDate(60),
        location: 'San Francisco, CA',
        imageUrl: 'https://images.pexels.com/photos/11035386/pexels-photo-11035386.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        price: 250.00,
        totalTickets: 50,
    },
    {
        name: 'Introduction to Web3',
        description:
            'A beginner-friendly session covering the fundamentals of Web3, blockchain, and smart contracts. No prior experience required!',
        date: getFutureDate(75),
        location: 'Online',
        imageUrl: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        price: 25.00,
        totalTickets: 500,
    },
    {
        name: 'Design Systems in Figma',
        description:
            'Learn how to create, manage, and scale a design system using Figma. This course is perfect for UI/UX designers and product teams.',
        date: getFutureDate(90),
        location: 'New York, NY',
        imageUrl: 'https://images.pexels.com/photos/3184429/pexels-photo-3184429.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        price: 75.00,
        totalTickets: 80,
    }
];

module.exports = events;