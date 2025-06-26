import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="flex items-center justify-center py-20 text-center">
            <div className="max-w-lg">
                <h1 className="text-9xl font-extrabold text-indigo-600 tracking-widest">
                    404
                </h1>
                <div className="bg-white px-2 text-xl font-semibold rounded rotate-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    Page Not Found
                </div>
                <div className="mt-4 text-left">
                    <p className="text-lg text-gray-700">
                        Oops! We can't seem to find the page you're looking for.
                    </p>
                    <p className="mt-2 text-gray-500">
                        It might have been moved, deleted, or maybe it never existed.
                    </p>
                </div>
                <Link
                    to="/"
                    className="mt-8 btn-inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 inline-block"
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;